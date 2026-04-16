const Session = require('../models/Session');
const ExchangeRequest = require('../models/ExchangeRequest');
const { createNotification } = require('../services/notificationService');

function formatSessionDateObj(date) {
  const d = new Date(date);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year} at ${hours}:${mins} ${ampm}`;
}

const createSession = async (req, res) => {
  try {
    const { requestId, skill, scheduledTime, duration } = req.body;
    
    if (!requestId || !skill || !scheduledTime || !duration) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const request = await ExchangeRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Sessions can only be created for accepted requests' });
    }

    const userId = req.user._id.toString();
    if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const proposedStart = new Date(scheduledTime).getTime();
    const proposedEnd = proposedStart + (duration * 60 * 1000);

    const conflicts = await Session.find({
      participants: { $in: [request.fromUser, request.toUser] },
      status: 'scheduled'
    });

    for (let session of conflicts) {
      const existingStart = new Date(session.scheduledTime).getTime();
      const existingEnd = existingStart + (session.duration * 60 * 1000);
      if (proposedStart < existingEnd && proposedEnd > existingStart) {
        return res.status(400).json({ success: false, message: 'One or more participants have a conflicting session at this time' });
      }
    }

    let session = new Session({
      requestId,
      participants: [request.fromUser, request.toUser],
      skill,
      scheduledTime,
      duration
    });

    await session.save();
    session = await session.populate('participants', 'name avatar');
    
    const otherParticipant = session.participants.find(p => p._id.toString() !== req.user._id.toString());
    if (otherParticipant) {
      createNotification({
        userId: otherParticipant._id,
        type: 'session_reminder',
        message: `A session for ${session.skill} has been scheduled on ${formatSessionDateObj(session.scheduledTime)}`,
        relatedId: session._id,
        relatedModel: 'Session'
      }).catch(err => console.error(err));
    }

    res.json({ success: true, data: session });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getSessionsByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ExchangeRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });

    const userId = req.user._id.toString();
    if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const sessions = await Session.find({ requestId })
      .sort({ scheduledTime: 1 })
      .populate('participants', 'name avatar');

    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getMySessions = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const sessions = await Session.find({ participants: currentUserId })
      .sort({ scheduledTime: 1 })
      .populate('participants', 'name avatar')
      .populate('requestId', 'offeredSkill requestedSkill');

    const upcoming = [];
    const past = [];
    const now = new Date();

    sessions.forEach(s => {
      const isPast = s.status === 'completed' || s.status === 'cancelled' || new Date(s.scheduledTime) < now;
      if (isPast) {
        past.push(s);
      } else {
        upcoming.push(s);
      }
    });

    res.json({ success: true, data: { upcoming, past } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    let session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    const isParticipant = session.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (session.status !== 'scheduled') {
       return res.status(400).json({ success: false, message: 'Session is already completed or cancelled' });
    }

    session.status = status;
    await session.save();

    if (status === 'completed') {
      await ExchangeRequest.findByIdAndUpdate(session.requestId, { sessionCompleted: true });
    }

    // populate before return
    const populated = await Session.findById(sessionId)
      .populate('participants', 'name avatar')
      .populate('requestId', 'offeredSkill requestedSkill');

    const response = { success: true, data: populated };
    if (status === 'completed') {
      response.canReview = true;
      
      session.participants.forEach(p => {
        createNotification({
          userId: p._id,
          type: 'session_completed',
          message: `Your session for ${session.skill} is complete. Leave a review!`,
          relatedId: session._id,
          relatedModel: 'Session'
        }).catch(err => console.error(err));
      });
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { createSession, getSessionsByRequest, getMySessions, updateSessionStatus };
