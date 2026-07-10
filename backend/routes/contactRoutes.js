const express = require('express');
const router = express.Router();
const {
  getContactConfig,
  updateContactConfig,
  submitContactMessage
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public route to get contact config & submit messages
router.get('/', getContactConfig);
router.post('/message', submitContactMessage);

// Admin-only route to update contact config
router.put('/', protect, authorize('admin'), upload.single('qrCode'), updateContactConfig);

module.exports = router;
