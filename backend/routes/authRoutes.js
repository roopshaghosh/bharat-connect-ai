const express = require('express');
const {
  register,
  login,
  googleLogin,
  getMe,
  getImpactStats,
} = require('../controllers/authController');
const { updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// Protected routes
router.get('/me', protect, getMe);
router.get('/impact', protect, getImpactStats);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
