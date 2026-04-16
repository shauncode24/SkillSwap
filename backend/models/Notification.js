const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'new_match',
      'request_received',
      'request_accepted',
      'request_rejected',
      'session_reminder',
      'session_completed',
      'new_message',
      'review_received'
    ],
    required: true
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedModel: {
    type: String,
    enum: ['ExchangeRequest', 'Session', 'Chat', 'Review', 'User'],
    default: null
  },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
