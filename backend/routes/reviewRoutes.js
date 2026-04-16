const express = require('express');
const router = express.Router();
const { submitReview, getReviewsByUser, getReviewsBySession } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitReview);
router.get('/user/:userId', protect, getReviewsByUser);
router.get('/session/:sessionId', protect, getReviewsBySession);

module.exports = router;
