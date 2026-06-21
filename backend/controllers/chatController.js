const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser } = require('../config/socket');

// @desc    Send a message in a conversation
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide conversationId and message content',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is a participant
    if (!conversation.participants.map(id => id.toString()).includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    // Create and save message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullname email avatar role');

    // Notify other participant
    const otherParticipantId = conversation.participants.find(
      (id) => id.toString() !== req.user.id
    );

    if (otherParticipantId) {
      // Create Notification alert
      const notification = await Notification.create({
        user: otherParticipantId,
        title: `New Message from ${req.user.fullname}`,
        message: content.length > 60 ? `${content.slice(0, 60)}...` : content,
        read: false,
      });

      // Emit events to other user in real-time
      emitToUser(otherParticipantId, 'message', populatedMessage);
      emitToUser(otherParticipantId, 'notification', notification);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'fullname email location role avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all messages for a specific conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is a participant
    if (!conversation.participants.map(id => id.toString()).includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view messages in this conversation',
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullname email avatar role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
};
