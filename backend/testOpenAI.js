import { generateAIResponse } from "./services/openaiService.js";

(async () => {
  try {
    const messages = [
      { role: "user", content: "tell me top 5 movies name of 2025" }
    ];

    const reply = await generateAIResponse(messages);
    console.log("AI Response:", reply);
  } catch (error) {
    console.error("Error:", error);
  }
})();

