const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");
const featureController = require('./controllers/feature');
const ApiKey = require('./models/ApiKey');
const authController = require('./controllers/auth');
const chatController = require('./controllers/chatController');
const upload = require('./middleware/upload');
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Register user route
app.post('/api/save-key', featureController.saveApiKey);
app.get('/api/get-key/:userId', featureController.getApiKey);
app.post('/api/register-user',verifyFirebaseToken, authController);
app.post('/api/save-messages', verifyFirebaseToken,  chatController.saveMessages);
app.get('/api/chats', verifyFirebaseToken, chatController.getUserChats);
app.get('/api/chats/:chatId', verifyFirebaseToken, chatController.getChatById);

app.post('/api/chats/del', verifyFirebaseToken, chatController.DeletePreviousMessages);

app.post('/api/chats/upload', upload.single('file'), featureController.uploadFile);
app.get('/api/chats/file/:chatId', featureController.getFile);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


