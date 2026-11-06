const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema(
  {
    revenueResetDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
