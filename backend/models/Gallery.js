const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Gym', 'Machines', 'Workout Area', 'Transformations', 'Events']
    },
    caption: {
      type: String,
      trim: true,
      default: ''
    },
    isHeroBanner: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);
