const express = require('express');
const router = express.Router();
const { getOrCreateChat, sendMessage, getChatMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:requestId', protect, getOrCreateChat);
router.post('/:requestId/message', protect, sendMessage);
router.get('/:requestId/messages', protect, getChatMessages);

module.exports = router;
