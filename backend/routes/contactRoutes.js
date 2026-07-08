const express = require('express');
const router = express.Router();
const {
  getContactConfig,
  updateContactConfig
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public route to get contact config
router.get('/', getContactConfig);

// Admin-only route to update contact config
router.put('/', protect, authorize('admin'), upload.single('qrCode'), updateContactConfig);

module.exports = router;
