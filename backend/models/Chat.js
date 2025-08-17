const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  title: { type: String, default: 'New Chat' }, // Display name in sidebar
  messages: [messageSchema],
  uploadedFile : {
    filename :{ type :String},
    fileUrl : { type : String},
    uploadedAt : { type : Date, default : Date.now}
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Keep updatedAt fresh when saving
chatSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Chat', chatSchema);


