const express = require('express');
const router = express.Router();
const { sendRequest, getMyRequests, respondToRequest } = require('../controllers/exchangeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, sendRequest);
router.get('/requests', protect, getMyRequests);
router.put('/respond/:id', protect, respondToRequest);

module.exports = router;
