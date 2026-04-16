const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredSkill: {
    type: String,
    required: true,
  },
  requestedSkill: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
