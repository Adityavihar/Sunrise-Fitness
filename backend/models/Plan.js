const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required']
    },
    durationMonths: {
      type: Number,
      required: [true, 'Plan duration in months is required']
    },
    benefits: [
      {
        type: String,
        required: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Plan', planSchema);
