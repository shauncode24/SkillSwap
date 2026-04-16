const ExchangeRequest = require('../models/ExchangeRequest');

const sendRequest = async (req, res) => {
  try {
    const { toUser, offeredSkill, requestedSkill, message, duration } = req.body;

    // Validate not sending to self
    if (toUser === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself." });
    }

    // Check for existing pending request in either direction
    const existingPending = await ExchangeRequest.findOne({
      $or: [
        { fromUser: req.user.id, toUser, status: 'pending' },
        { fromUser: toUser, toUser: req.user.id, status: 'pending' }
      ]
    });

    if (existingPending) {
      return res.status(400).json({ success: false, message: "A pending request already exists between you and this user" });
    }

    // Create request
    let request = new ExchangeRequest({
      fromUser: req.user.id,
      toUser,
      offeredSkill,
      requestedSkill,
      message,
      duration
    });

    await request.save();

    request = await request.populate('fromUser', 'name avatar');
    request = await request.populate('toUser', 'name avatar');

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Error sending request:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }]
    })
    .populate('fromUser', 'name avatar rating')
    .populate('toUser', 'name avatar rating')
    .sort({ createdAt: -1 });

    const sent = [];
    const received = [];

    requests.forEach(reqObj => {
      if (reqObj.fromUser._id.toString() === req.user.id.toString()) {
        sent.push(reqObj);
      } else {
        received.push(reqObj);
      }
    });

    res.json({ success: true, data: { sent, received } });
  } catch (error) {
    console.error('Error fetching requests:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.toUser.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to respond to this request." });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Request has already been responded to." });
    }

    request.status = status;
    await request.save();

    const updatedRequest = await request.populate('fromUser', 'name avatar rating');
    await updatedRequest.populate('toUser', 'name avatar rating');

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Error responding to request:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  sendRequest,
  getMyRequests,
  respondToRequest
};
