const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');

const submitReview = async (req, res) => {
  try {
    const { sessionId, revieweeId, rating, comment } = req.body;
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed sessions' });
    }

    const userId = req.user._id.toString();
    const isParticipant = session.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (session.feedbackGiven.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this session' });
    }

    if (revieweeId === userId) {
      return res.status(400).json({ success: false, message: 'Cannot review yourself' });
    }

    let review = new Review({
      sessionId,
      requestId: session.requestId,
      reviewer: userId,
      reviewee: revieweeId,
      rating,
      comment
    });

    await review.save();

    session.feedbackGiven.push(userId);
    await session.save();

    // Recalculate reviewee's aggregate rating
    const allReviews = await Review.find({ reviewee: revieweeId });
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      await User.findByIdAndUpdate(revieweeId, { rating: Math.round(avgRating * 10) / 10 });
    }

    review = await review.populate('reviewer', 'name avatar');

    res.json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this session' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getReviewsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const userId = req.user._id.toString();
    const isParticipant = session.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const reviews = await Review.find({ sessionId }).populate('reviewer', 'name avatar');
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { submitReview, getReviewsByUser, getReviewsBySession };
