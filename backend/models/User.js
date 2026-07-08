const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bmiHistorySchema = new mongoose.Schema({
  bmi: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    profilePicture: {
      type: String,
      default: ''
    },
    age: {
      type: Number,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: ''
    },
    height: {
      type: Number, // in cm
      default: null
    },
    weight: {
      type: Number, // in kg
      default: null
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null
    },
    membershipStatus: {
      type: String,
      enum: ['inactive', 'pending', 'active', 'expired', 'suspended'],
      default: 'inactive'
    },
    membershipStart: {
      type: Date,
      default: null
    },
    membershipExpiry: {
      type: Date,
      default: null
    },
    bmiHistory: [bmiHistorySchema],
    notifications: [notificationSchema],
    refreshToken: {
      type: String,
      default: null
    },
    sessionLogs: [
      {
        loginTime: { type: Date, default: Date.now },
        logoutTime: { type: Date }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
