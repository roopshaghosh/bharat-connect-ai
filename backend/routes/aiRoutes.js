const express = require('express');
const { generateOpportunity, getRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate volunteer opportunity details using AI
router.post('/generate-opportunity', protect, generateOpportunity);

// Get personalized matches and recommendations using AI
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
