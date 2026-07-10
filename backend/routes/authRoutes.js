const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyUser,
  clearNotifications
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/verify', protect, verifyUser);
router.delete('/notifications', protect, clearNotifications);

module.exports = router;
