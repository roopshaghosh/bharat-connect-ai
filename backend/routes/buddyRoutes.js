const express = require('express');
const { chatWithBuddy } = require('../controllers/buddyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Bharat Buddy chatbot endpoint
router.post('/chat', protect, chatWithBuddy);

module.exports = router;
