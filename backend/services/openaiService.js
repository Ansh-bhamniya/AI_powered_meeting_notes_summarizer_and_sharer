const OpenAI = require("openai");
const ApiKey = require("../models/ApiKey"); // adjust path if needed

const errorMap = {
  NO_API_KEY: { status: 400, message: "NO_VALID_API_KEY" },
  INVALID_API_KEY: { status: 400, message: "INVALID_API_KEY" },
  OPENAI_RATE_LIMIT: { status: 429, message: "TOO_MANY_REQUESTS" },
  OPENAI_SERVER_ERROR: { status: 502, message: "OPENAI_SERVER_ERROR" }
};

/**
 * Generate an AI response for a given userId and chat messages.
 * @param {String} userId - The MongoDB userId
 * @param {Array} messages - Array of { role, content } chat messages
 */
const generateAIResponse = async (userId, messages) => {
  try {
    // Get the user's stored API key
    const user = await ApiKey.findOne({ userId });
    if (!user || !user.apiKey) {
      const err = new Error("API key not found for this user");
      err.code = "NO_API_KEY";
      throw err;
    }
  

    // Create an OpenAI client with this user's API key
    const client = new OpenAI({ apiKey: user.apiKey });

    // Request AI completion
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4o
      messages: [
        {
          role: "system",
          content: `
          You are ChatGPT, a helpful, conversational AI assistant in a chat app.
              Always reply in clear, natural, human-like sentences, as if chatting with a friend.
              Do not output lists unless explicitly asked.
              Avoid meta commentary (e.g., "As an AI...").
              Keep messages concise but friendly.
              Always continue the tone of the conversation naturally.
          `
        },
        ...messages
      ]
    });


    // for eg-json only with these keys   for eg {message:content generated}
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Service Error:", error);

    if (error.status === 401 || error.code === "invalid_api_key") {
      const err = new Error("INVALID_API_KEY");
      err.code = "INVALID_API_KEY";
      throw err;
    }
    if( error.response?.status == 429){
      const err = new Error("Rate limit reached");
      err.code = "OPENAI_RATE_LIMIT";
      throw err;
    }
    if( error.response?.status >= 500){
      const err = new Error("OpenAI server error");
      err.code = "OPENAI_SERVER_ERROR";
      throw err;
    }
    if(error.code && errorMap[error.code]){
      throw  error;
    }
    throw error;
  }
};

module.exports = { generateAIResponse };
