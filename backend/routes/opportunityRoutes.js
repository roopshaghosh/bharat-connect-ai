const express = require('express');
const {
  createOpportunity,
  getOpportunities,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');
const {
  applyOpportunity,
  getOpportunityApplicants,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getOpportunities);

// NGO role protected routes
router.post('/', protect, authorize('NGO'), createOpportunity);
router.put('/:id', protect, authorize('NGO'), updateOpportunity);
router.delete('/:id', protect, authorize('NGO'), deleteOpportunity);

// Application routes nested under opportunities
router.post('/:id/apply', protect, authorize('Volunteer'), applyOpportunity);
router.get('/:id/applicants', protect, authorize('NGO'), getOpportunityApplicants);

module.exports = router;
