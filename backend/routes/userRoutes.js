const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  discoverUsers,
  getUserById,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes are protected
router.use(protect);

// GET  /api/users/profile  — get my profile
// PUT  /api/users/profile  — update my profile
router.route('/profile').get(getMyProfile).put(updateMyProfile);

// GET  /api/users/discover — discover/filter users
// IMPORTANT: This must come BEFORE /:id to avoid "discover" being parsed as an id
router.get('/discover', discoverUsers);

// GET  /api/users/:id — get any user's public profile by ID
router.get('/:id', getUserById);

module.exports = router;
