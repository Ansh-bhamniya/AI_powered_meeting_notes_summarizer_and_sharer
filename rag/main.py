from fastapi import FastAPI, UploadFile, File, HTTPException
from summary import init

app = FastAPI()

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

genai.configure(api_key=api_key)

db_directory = "/content/chroma_db"

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, google_api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')



# embeddings = HuggingFaceEmbeddings(
#     model_name="sentence-transformers/all-MiniLM-L6-v2"
# )

# file_path = "./transcript.txt"

db = None

@app.get("/health")
async def health_check():
    return {"status": "ok"}


UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-txt")
async def upload_txt(file: UploadFile = File(...)):
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .txt files are allowed")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save file to server
    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)

    init(file_path, embeddings)
    
    return {"filename": file.filename, "path": file_path}

@app.get("/getSummary")
async def get_summary():
    return

@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello, {name}!"}
