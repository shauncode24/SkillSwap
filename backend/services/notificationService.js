const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, message, relatedId, relatedModel }) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      relatedId,
      relatedModel
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

module.exports = { createNotification };
