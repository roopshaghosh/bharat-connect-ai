const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a badge name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a badge description'],
      trim: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Badge', badgeSchema);
