const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin-only dashboard statistics
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

module.exports = router;
