const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

chatSchema.index({ requestId: 1 });
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
