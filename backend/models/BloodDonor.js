const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please add a blood group'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodDonor', bloodDonorSchema);
