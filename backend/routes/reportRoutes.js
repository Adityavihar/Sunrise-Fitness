const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  resetRevenue,
  restoreRevenue
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin-only dashboard statistics & revenue reset management
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.post('/reset-revenue', protect, authorize('admin'), resetRevenue);
router.post('/restore-revenue', protect, authorize('admin'), restoreRevenue);

module.exports = router;
