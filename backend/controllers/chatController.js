const Chat = require('../models/Chat');
const ExchangeRequest = require('../models/ExchangeRequest');

const getOrCreateChat = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ExchangeRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Exchange request not found' });
    }
    if (request.status !== 'accepted') {
      return res.status(403).json({ success: false, message: 'Chat is only available for accepted requests' });
    }
    
    const userId = req.user._id.toString();
    if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'User is not a participant' });
    }

    let chat = await Chat.findOne({ requestId }).populate('participants', 'name avatar');
    
    if (!chat) {
      chat = new Chat({
        requestId,
        participants: [request.fromUser, request.toUser],
        messages: []
      });
      await chat.save();
      chat = await chat.populate('participants', 'name avatar');
    }
    
    res.json({ success: true, data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
       return res.status(400).json({ success: false, message: 'Message text is required' });
    }
    
    let chat = await Chat.findOne({ requestId });
    if (!chat) {
       return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    const userId = req.user._id.toString();
    const isParticipant = chat.participants.some(p => p.toString() === userId);
    
    if (!isParticipant) {
       return res.status(403).json({ success: false, message: 'User is not a participant' });
    }
    
    chat.messages.push({
       senderId: req.user._id,
       text,
       timestamp: Date.now()
    });
    
    await chat.save();
    chat = await chat.populate('participants', 'name avatar');
    
    res.json({ success: true, data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    let chat = await Chat.findOne({ requestId }).populate('participants', 'name avatar');
    if (!chat) {
       return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    const userId = req.user._id.toString();
    const isParticipant = chat.participants.some(p => p._id.toString() === userId);
    
    if (!isParticipant) {
       return res.status(403).json({ success: false, message: 'User is not a participant' });
    }
    
    if (chat.messages.length > limit) {
      chat.messages = chat.messages.slice(-limit);
    }
    
    res.json({ success: true, data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getOrCreateChat, sendMessage, getChatMessages };
