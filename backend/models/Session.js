const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  skill: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  feedbackGiven: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  createdAt: { type: Date, default: Date.now }
});

sessionSchema.index({ requestId: 1 });
sessionSchema.index({ participants: 1 });
sessionSchema.index({ scheduledTime: 1 });

module.exports = mongoose.model('Session', sessionSchema);
