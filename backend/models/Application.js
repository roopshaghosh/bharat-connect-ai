const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillOpportunity',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: 'Status must be pending, accepted, or rejected',
      },
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from applying to the same opportunity multiple times
applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
