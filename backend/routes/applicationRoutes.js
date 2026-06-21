const express = require('express');
const { updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// NGO role protected status updates
router.patch('/:id', protect, authorize('NGO'), updateApplicationStatus);

module.exports = router;
