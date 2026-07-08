const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendTokenResponse } = require('../utils/generateTokens');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, age, gender, height, weight } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists (by email or phone)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address is already registered' });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered' });
    }

    // If first user, make them Admin. Otherwise Member.
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'member';

    // Get profile picture URL if uploaded
    const profilePicture = req.file ? getFileUrl(req.file, req) : '';

    const newUser = new User({
      name,
      email,
      phone,
      password,
      role,
      profilePicture,
      age: age ? Number(age) : null,
      gender: gender || '',
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null
    });

    // Record initial BMI if height and weight are provided
    if (height && weight) {
      const heightInMeters = Number(height) / 100;
      const bmi = Number(weight) / (heightInMeters * heightInMeters);
      newUser.bmiHistory.push({
        bmi: Math.round(bmi * 10) / 10,
        weight: Number(weight)
      });
    }

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get tokens (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter credentials' });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If user is suspended, block login
    if (user.membershipStatus === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact the administrator.' });
    }

    // Record login timestamp
    user.sessionLogs.push({ loginTime: new Date() });
    await user.save();

    // Send token response
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const refreshCookie = req.cookies.refreshToken;

    if (!refreshCookie) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Find user by refresh token
    const user = await User.findOne({ refreshToken: refreshCookie });
    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token mapping' });
    }

    // Verify token
    jwt.verify(refreshCookie, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ success: false, message: 'Refresh token expired or invalid' });
      }

      // Generate new Access Token
      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
      });

      const isProduction = process.env.NODE_ENV === 'production';
      const accessCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 mins
      };

      res.cookie('accessToken', accessToken, accessCookieOptions);
      res.status(200).json({ success: true, message: 'Token refreshed' });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Server error refreshing token' });
  }
};

// @desc    Log user out / clear cookies
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    // Record logout timestamp
    if (req.user && req.user.id) {
      const userObj = await User.findById(req.user.id);
      if (userObj && userObj.sessionLogs.length > 0) {
        const lastSession = userObj.sessionLogs[userObj.sessionLogs.length - 1];
        if (!lastSession.logoutTime) {
          lastSession.logoutTime = new Date();
          await userObj.save();
        }
      }
    }

    const refreshCookie = req.cookies.refreshToken;

    if (refreshCookie) {
      // Find user and clear their refresh token
      await User.findOneAndUpdate(
        { refreshToken: refreshCookie },
        { refreshToken: null }
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

// @desc    Verify current user / Get profile
// @route   GET /api/auth/verify
// @access  Private
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('membershipPlan');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        membershipStatus: user.membershipStatus,
        membershipPlan: user.membershipPlan,
        membershipStart: user.membershipStart,
        membershipExpiry: user.membershipExpiry,
        bmiHistory: user.bmiHistory,
        notifications: user.notifications
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying user' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyUser
};
