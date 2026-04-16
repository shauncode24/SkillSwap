const express = require('express');
const router = express.Router();
const { createSession, getSessionsByRequest, getMySessions, updateSessionStatus } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createSession);
router.get('/my', protect, getMySessions);
router.get('/:requestId', protect, getSessionsByRequest);
router.put('/:sessionId/status', protect, updateSessionStatus);

module.exports = router;
