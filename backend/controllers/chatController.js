const Chat = require('../models/Chat');
const { generateAIResponse  } = require('../services/openaiService');

exports.saveMessages = async (req, res) => {
  try {
    const userId = req.user.uid; // From Firebase middleware
    const { chatId, message, title } = req.body;

    // Validate message
    if (!message || !message.sender || !message.text) {
      return res.status(400).json({ error: "Invalid message format" });
    }

    let chat;

    if (chatId) {
        // Append to existing chat
        chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
          return res.status(404).json({ error: "Chat not found" });
        }
  
        chat.messages.push({
          sender: message.sender,
          text: message.text,
          timestamp: new Date(),
        });
  
      } else {
        // Create a new chat with the first user message
        chat = new Chat({ 
          userId,
          title: title || message.text.slice(0, 20),
          messages: [{
            sender: message.sender,
            text: message.text,
            timestamp: new Date(),
          }],
        });
      }

    // Prepare conversation for OpenAI
    const aiMessages = chat.messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));    

    // 4️⃣ Get AI reply with error handling for missing/invalid key
    let aiReply;
    try {
      aiReply = await generateAIResponse(userId, aiMessages);
    } catch (err) {
      if (err.code === "NO_API_KEY") {
        return res.status(400).json({ error: "NO_VALID_API_KEY" });
      }
      if (err.code === "INVALID_API_KEY") {
        return res.status(400).json({ error: "INVALID_API_KEY" });
      }
      throw err;
    }
    
    // const aiReply = await generateAIResponse(aiMessages,apikey);  

    // Add assistant message
    chat.messages.push({
        sender: "assistant",
        text: aiReply,
        timestamp : new Date(),
      });
      

    await chat.save();
    console.log(chat);
    // console.log(chat);
    res.json({ success: true, chat, aiReply });
    // console.log("Saved chat:", chat);

  } catch (error) {
    console.error("Save message error:", error);
  
    // Map if error code exists
    if (error.code && errorMap[error.code]) {
      const { status, message } = errorMap[error.code];
      return res.status(status).json({ error: message });
    }
  
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
}




exports.DeletePreviousMessages=async(req,res) => {
    
const {chat_id}=req.body;
if(!chat_id){
    return res.json({"message":"send the chat id"})
}
const delchatId=await Chat.findByIdAndDelete({_id:chat_id})

if(delchatId){
    return res.status(200).json({"message":"deleted"})
}



}


exports.getUserChats = async (req, res) => {
    try {
      const userId = req.user.uid;
  
      const chats = await Chat.find({ userId })
        .sort({ updatedAt: -1 }) // recent chats first
        .select('_id title messages updatedAt') // select fields you want
  
      // Optionally, send only the last message for sidebar preview
      const chatSummaries = chats.map(chat => ({
        _id: chat._id,
        title: chat.title,
        lastMessage: chat.messages[chat.messages.length - 1],
        updatedAt: chat.updatedAt
      }));
  
      res.json({ success: true, chats: chatSummaries });
    } catch (error) {
      console.error("Load chats error:", error);
      res.status(500).json({ error: error.message });
    }
  };


exports.getChatById = async (req, res) => {
    try {
    
      const userId = req.user.uid;
      const { chatId } = req.params;
      
  
      const chat = await Chat.findOne({ _id: chatId, userId });
  
      if (!chat) return res.status(404).json({ error: "Chat not found" });
  
      res.json({ success: true, chat });
    } catch (error) {
      console.error("Load chat error:", error);
      res.status(500).json({ error: error.message });
    }
  };

  


