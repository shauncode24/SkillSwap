const User = require('../models/User');
const { computeMatches } = require('../services/matchingService');

const getRecommendations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch all other users, excluding password and email
    const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('-password -email');

    const rankedMatches = computeMatches(currentUser, allUsers);

    res.json({
      success: true,
      count: rankedMatches.length,
      data: rankedMatches
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(500).json({ success: false, message: 'Server error when fetching recommendations' });
  }
};

module.exports = {
  getRecommendations,
};
