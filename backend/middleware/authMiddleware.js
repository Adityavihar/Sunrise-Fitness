const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify access token cookie or Authorization Bearer header
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    // Fallback to Authorization: Bearer <token> header (essential for iOS Safari cross-site cookie restrictions)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, please log in' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user record not found' });
    }

    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Session expired, please log in again' });
  }
};

// Authorize user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'none'}' is unauthorized`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
