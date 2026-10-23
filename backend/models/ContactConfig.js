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
      default: 'https://www.google.com/maps/dir//SUNRISE+FITNESS+HUB,+79GW%2B4WH,+Annavaram+Colony,+Bendapudi,+Andhra+Pradesh+533406/@17.2753148,82.3973547,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3a39cf00101fe5fd:0x3f84b3ba0e608f36!2m2!1d82.3973547!2d17.2753148'
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
