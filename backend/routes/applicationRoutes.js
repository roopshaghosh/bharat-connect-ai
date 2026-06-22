const express = require('express');
const {
  updateApplicationStatus,
  getApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get volunteer applications (for volunteer applicant or NGO)
router.get('/', protect, getApplications);

// NGO role protected status updates
router.put('/:id', protect, authorize('NGO'), updateApplicationStatus);
router.patch('/:id', protect, authorize('NGO'), updateApplicationStatus);

module.exports = router;
