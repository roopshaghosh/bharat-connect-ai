const express = require('express');
const { generateOpportunity } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate volunteer opportunity details using AI
router.post('/generate-opportunity', protect, generateOpportunity);

module.exports = router;
