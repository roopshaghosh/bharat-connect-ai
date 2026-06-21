const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  respondedAt: {
    type: Date,
    default: Date.now,
  }
});

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: [true, 'Please add a patient name'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please add a blood group'],
      trim: true,
    },
    unitsNeeded: {
      type: Number,
      default: 1,
    },
    hospital: {
      type: String,
      required: [true, 'Please add a hospital name'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location/area'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number'],
      trim: true,
    },
    urgency: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled'],
      default: 'pending',
    },
    responses: [responseSchema]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
