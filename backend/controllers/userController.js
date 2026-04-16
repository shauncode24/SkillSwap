const User = require('../models/User');

/**
 * @route   GET /api/users/profile
 * @desc    Get the currently authenticated user's full profile
 * @access  Protected
 */
const getMyProfile = async (req, res) => {
  try {
    // req.user is already populated by the protect middleware (password excluded)
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('GetMyProfile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update the currently authenticated user's profile
 * @access  Protected
 */
const updateMyProfile = async (req, res) => {
  try {
    // Only allow these fields to be updated
    const allowedFields = ['name', 'bio', 'avatar', 'teachSkills', 'learnSkills', 'availability'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // If no valid fields were provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('UpdateMyProfile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    });
  }
};

/**
 * @route   GET /api/users/discover
 * @desc    Discover users with optional filtering by skill, level, and availability
 * @access  Protected
 */
const discoverUsers = async (req, res) => {
  try {
    const { skill, level, availability } = req.query;

    // Exclude the current user
    const filter = { _id: { $ne: req.user._id } };

    // Filter by teachSkills name (case-insensitive, partial match)
    if (skill) {
      filter['teachSkills.name'] = { $regex: skill, $options: 'i' };
    }

    // Filter by teachSkills level (exact match)
    if (level) {
      filter['teachSkills.level'] = level;
    }

    // Filter by availability day (case-insensitive)
    if (availability) {
      filter['availability.day'] = { $regex: new RegExp(`^${availability}$`, 'i') };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ rating: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('DiscoverUsers error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error discovering users',
    });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get a user's public profile by their MongoDB _id
 * @access  Protected
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Handle invalid ObjectId format gracefully
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    console.error('GetUserById error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user',
    });
  }
};

module.exports = { getMyProfile, updateMyProfile, discoverUsers, getUserById };
