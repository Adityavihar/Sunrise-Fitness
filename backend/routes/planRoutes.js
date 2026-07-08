const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/planController');
const { protect, authorize } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Custom optional-auth middleware to allow admins to see inactive plans
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // If token is invalid or expired, just proceed without req.user
  }
  next();
};

// Public routes
router.get('/', optionalAuth, getPlans);
router.get('/:id', getPlanById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createPlan);
router.put('/:id', protect, authorize('admin'), updatePlan);
router.delete('/:id', protect, authorize('admin'), deletePlan);

module.exports = router;
