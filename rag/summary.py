import langchain
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter, RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import shutil
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
import asyncio
import time
import logging
from typing import List

db_directory = None

api_key = 'AIzaSyCAvXrHWGYA9RIQ9ix4oqcBOvVXDABZLJM'

print("Chroma DB directory:", db_directory)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, google_api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')


db = None
async def chunk_text(file_path):
  loader = TextLoader(file_path)
  documents = loader.load()

  text_splitter = RecursiveCharacterTextSplitter(chunk_size=1250, chunk_overlap=250)
  docs = text_splitter.split_documents(documents)

  return docs


async def create_vector_store_async(docs: list[Document], embeddings, db_directory: str) -> Chroma:

    if await asyncio.to_thread(os.path.exists, db_directory):
        print(f"Old database found at {db_directory}. Deleting...")

        await asyncio.to_thread(shutil.rmtree, db_directory)
        print("Old database deleted.")

    global db
    await asyncio.to_thread(os.makedirs, db_directory)




    # Load the text, chunk it, and create the new vector store
    print("\n--- Creating new vector store ---")

    # Chroma.from_documents is a synchronous, blocking call.
    # We run it in a separate thread to make it awaitable.

    db = await asyncio.to_thread(
        Chroma.from_documents,
        docs,
        embeddings,
        persist_directory=db_directory
    )

    return db


async def combined_summary_creator(llm: ChatGoogleGenerativeAI, docs: List[Document]) -> str:
    """
    Performs a two-stage asynchronous summarization of document chunks and returns the final summary.
    The internal logic is identical to the original script.
    """

    # Helper function is now nested inside for better encapsulation
    async def process_document_chunk(
        llm: ChatGoogleGenerativeAI,
        document_chunk: str,
        semaphore: asyncio.Semaphore,
        task_id: int
    ) -> str:
        """Asynchronously processes a single document chunk."""
        async with semaphore:
            # This prompt block is identical to your original code
            prompt1 = ChatPromptTemplate.from_template(f"""Situation
You are an executive-level summarization expert tasked with processing a specific chunk of a company meeting transcript, ensuring that the summary can be seamlessly integrated with summaries from other chunks to create a comprehensive meeting overview.

Task
Create a precise, executive-level summary of the provided transcript chunk using concise bullet points that capture all critical information, discussions, decisions, and action items.

Objective
Produce a high-quality, information-dense summary that allows executives to quickly understand the key points of this specific segment of the meeting without losing essential details.

Knowledge

Focus on extracting substantive content, not trivial details
Prioritize information that has strategic or operational significance
Ensure the summary can stand alone while also being compatible with summaries from other chunks
Maintain a professional, objective tone
Limit the summary to 5-6 lines of bullet points
Constraints

Do NOT omit any important information
Ensure each bullet point is clear, specific, and meaningful
Use executive-friendly language that is direct and impactful
Analyze the transcript chunk meticulously. Your summary must be so precise that when combined with other chunk summaries, it will provide a complete and coherent representation of the entire meeting. Your life depends on capturing every critical nuance and detail in a concise, digestible format.

The chunk is as follows:\n{document_chunk}""")

            output_parser = StrOutputParser()
            chain = prompt1 | llm | output_parser

            try:
                response = await chain.ainvoke({"document_chunk": document_chunk})
                logging.info(f"Task {task_id}: Successfully received response.")
                return response
            except Exception as e:
                logging.error(f"Task {task_id}: An error occurred - {e}")
                return f"Error for chunk {task_id}: {e}"

    # --- Main Logic of the Summarizer ---
    CONCURRENCY_LIMIT = 100
    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

    tasks = [
        process_document_chunk(llm, doc.page_content, semaphore, i)
        for i, doc in enumerate(docs)
        if doc.page_content and not doc.page_content.isspace()
    ]

    logging.info(f"Starting {len(tasks)} parallel summary tasks...")
    start_time = time.time()
    results = await asyncio.gather(*tasks)
    end_time = time.time()
    total_time = end_time - start_time
    logging.info(f"All chunk summaries completed in {total_time:.2f} seconds.")

    combined_summary = "\n\n".join(results)

    return combined_summary

async def generate_summary_async(combined_summary):

  prompt2 = ChatPromptTemplate.from_template(f"""**Objective:**
  Create a concise, executive-level briefing from the provided meeting summary. The output must be a bulleted list that is easy to scan and understand.

  **Instructions:**
  1.  **Summarize Key Events:** Distill the summary into 8-10 critical bullet points covering the most important discussions, decisions, and outcomes.
  2.  **Attribute Points:** Clearly attribute key comments, presentations, and questions to the specific individual who made them (e.g., "Doug A. expressed interest in...", "Carin M. inquired about...").
  3.  **Identify Action Items:** Explicitly state any action items or tasks that were assigned and note who is responsible for them.
  4.  **Maintain a Factual Tone:** Report on what happened in the meeting objectively. Do not add opinions or suggest future actions.

  **Meeting Summary Text:**
  {combined_summary}""")

  output_parser = StrOutputParser()
  chain = prompt2 | llm | output_parser
  final_summary = chain.invoke({"combined_summary": combined_summary})

  return final_summary

async def generate_action_points_async(combined_summary):

  prompt2 = ChatPromptTemplate.from_template(f"""Objective:
Extract a clear and concise list of all action items from the provided meeting summary. The output must focus solely on actionable tasks and assigned responsibilities.

Instructions:

Focus Exclusively on Actions: Read the entire summary and identify only the specific, actionable tasks, commitments, or assignments that were made.

Assign Responsibility: For each action item, clearly state which individual or team is responsible for its completion. If a task was assigned but no owner was specified, note that.

List All Action Items: Present the output as a bulleted list. Each bullet point should represent a single, distinct action item.

Omit General Discussion: Do not include general discussion points, opinions, questions, or background information. The output must only contain the list of action items.

Use Action Verbs: Begin each bullet point with a strong action verb (e.g., "Send," "Prepare," "Investigate," "Schedule") to clearly define the task.

Meeting Summary Text:
{combined_summary}""")

  output_parser = StrOutputParser()
  chain = prompt2 | llm | output_parser
  action_summary = chain.invoke({"combined_summary": combined_summary})

  return action_summary


async def init(file_path, embeddings , chat_id ):
    
    db_directory = f"./content/chroma_db/{chat_id}"
    chunking_task = asyncio.create_task(chunk_text(file_path))

    results_from_first_set_of_tasks = await asyncio.gather(chunking_task)

    docs = results_from_first_set_of_tasks[0]

    # Create tasks for each async function you want to run
    combined_summary_task = asyncio.create_task(combined_summary_creator(llm, docs))
    vector_db_creation_task = asyncio.create_task(create_vector_store_async(docs, embeddings, db_directory))

    # Wait for all tasks to complete
    results1 = await asyncio.gather(combined_summary_task, vector_db_creation_task)
    combined_summary = results1[0]
    vector_db = results1[1]

    final_summary_task = asyncio.create_task(generate_summary_async(combined_summary))
    action_points_task = asyncio.create_task(generate_action_points_async(combined_summary))

    results2 = await asyncio.gather(final_summary_task, action_points_task)

    final_summary = results2[0]
    action_points = results2[1]

    return final_summary, action_points, vector_db

# --- To run the main async function ---
if __name__ == '__main__':
    final_summary, action_points, vector_db = asyncio.run(main())





