// controllers/feature.js
const ApiKey = require('../models/ApiKey');
const fs = require('fs');
const Chat = require('../models/Chat');
const path = require('path'); 

exports.saveApiKey = async (req, res) => {
  const { userId, apiKey } = req.body;

  if (!userId || !apiKey) {
    return res.status(400).json({ error: 'userId and apiKey are required' });
  }

  try {
    // Update apiKey if user exists, else create new user document with userId and apiKey
    const updated = await ApiKey.findOneAndUpdate(
      { userId },
      { apiKey },
      { new: true, upsert: true }
    );

    console.log('API key saved/updated:', updated);
    res.json({ message: 'API key saved successfully', data: updated });
  } catch (error) {
    console.error(' Error saving API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
 

exports.getApiKey = async (req, res) => {
    console.log("bkl");
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }
  
    try {
      const user = await ApiKey.findOne({ userId });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ apiKey: user.apiKey || '' });
    } catch (error) {
      console.error('Error fetching API key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.uploadFile = async (req, res) => {
    try {
      let { chatId, userId } = req.body; // userId is required if chatId is missing
  
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
      let chat;
  
      if (chatId) {
        // Find existing chat
        chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
      } else {
        // Create a new chat if chatId not provided
        if (!userId) return res.status(400).json({ message: 'userId is required to create a chat' });
  
        chat = new Chat({
          userId,
          title: 'New Chat',
          messages: [],
        });
      }
  
      // Attach uploaded file
      chat.uploadedFile = {
        filename: req.file.originalname,
        fileUrl: req.file.path,
        uploadedAt: new Date()
      };
  
      await chat.save();
  
      res.status(200).json({
        message: 'File uploaded successfully',
        chatId: chat._id,
        file: chat.uploadedFile
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

// Retrieve uploaded file info
exports.getFile = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.uploadedFile) {
      return res.status(404).json({ message: 'No file found for this chat' });
    }

    // Send only the file path (metadata)
    res.json({
      filename: chat.uploadedFile.filename,
      fileUrl: chat.uploadedFile.fileUrl, // relative path on server
      uploadedAt: chat.uploadedFile.uploadedAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

