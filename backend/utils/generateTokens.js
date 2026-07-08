const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token in database for the user
  user.refreshToken = refreshToken;
  await user.save();

  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token Cookie (Expires in 15 minutes)
  const accessCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  };

  // Refresh Token Cookie (Expires in 7 days)
  const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(statusCode).json({
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
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendTokenResponse
};
