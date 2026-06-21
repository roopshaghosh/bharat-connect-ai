const express = require('express');
const {
  sendMessage,
  getConversations,
  getMessages,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/message', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);

module.exports = router;
