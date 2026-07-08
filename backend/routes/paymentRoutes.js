const express = require('express');
const router = express.Router();
const {
  submitPayment,
  getMemberPayments,
  getAllPayments,
  verifyPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Member payment actions
router.post('/', protect, authorize('member'), upload.single('screenshot'), submitPayment);
router.get('/my-payments', protect, authorize('member'), getMemberPayments);

// Admin-only payment verification actions
router.get('/', protect, authorize('admin'), getAllPayments);
router.put('/:id/verify', protect, authorize('admin'), verifyPayment);

module.exports = router;
