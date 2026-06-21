const mongoose = require('mongoose');

const skillOpportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline date'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SkillOpportunity', skillOpportunitySchema);
