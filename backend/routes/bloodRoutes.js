const express = require('express');
const {
  becomeDonor,
  createRequest,
  getRequests,
  respondToRequest,
  updateRequestStatus,
} = require('../controllers/bloodController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register as a blood donor
router.post('/donor', protect, becomeDonor);

// Standard/compat blood request routes
router.route('/request')
  .post(protect, createRequest);

router.route('/requests')
  .get(getRequests)
  .post(protect, createRequest);

// Response & status update routes (primarily used by frontend client)
router.post('/requests/:id/respond', protect, respondToRequest);
router.put('/requests/:id', protect, updateRequestStatus);

module.exports = router;
