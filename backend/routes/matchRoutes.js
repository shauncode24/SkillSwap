const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommendations', protect, getRecommendations);

module.exports = router;
