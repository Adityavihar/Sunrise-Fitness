const mongoose = require('mongoose');

const contactConfigSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      default: 'Kapilivaivari Street, infront of Seshadri Sadan, Annavarm, 533406'
    },
    phone: {
      type: String,
      default: '9299999288'
    },
    email: {
      type: String,
      default: 'contact@sunrisefitnesshub.com'
    },
    whatsapp: {
      type: String,
      default: '9299999288'
    },
    googleMapsLink: {
      type: String,
      default: 'https://maps.google.com'
    },
    openingHours: {
      type: String,
      default: 'Mon-Sat: 5:00 AM - 10:00 PM, Sun: 6:00 AM - 12:00 PM'
    },
    qrCode: {
      type: String,
      default: ''
    },
    socialMedia: {
      instagram: {
        type: String,
        default: ''
      },
      facebook: {
        type: String,
        default: ''
      },
      youtube: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ContactConfig', contactConfigSchema);
