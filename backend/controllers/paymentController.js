const Payment = require('../models/Payment');
const User = require('../models/User');
const Plan = require('../models/Plan');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// @desc    Submit payment screenshot & transaction details (Member)
// @route   POST /api/payments
// @access  Private/Member
const submitPayment = async (req, res) => {
  try {
    const { planId, upiTransactionId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: 'Please select a membership plan' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload the payment screenshot' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Selected plan not found' });
    }

    const screenshotUrl = getFileUrl(req.file, req);

    const payment = await Payment.create({
      user: req.user.id,
      plan: planId,
      amount: plan.price,
      screenshot: screenshotUrl,
      upiTransactionId: upiTransactionId || ''
    });

    // Update user status to pending
    await User.findByIdAndUpdate(req.user.id, {
      membershipStatus: 'pending',
      $push: {
        notifications: {
          message: `Payment of ₹${plan.price} for plan "${plan.name}" is pending admin verification.`,
          read: false
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully! Waiting for administrator approval.',
      payment
    });
  } catch (error) {
    console.error('Submit payment error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting payment' });
  }
};

// @desc    Get member's own payment history (Member)
// @route   GET /api/payments/my-payments
// @access  Private/Member
const getMemberPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error('Get member payments error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving payments' });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email phone profilePicture')
      .populate('plan')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving payments list' });
  }
};

// @desc    Approve/Reject payment (Admin)
// @route   PUT /api/payments/:id/verify
// @access  Private/Admin
const verifyPayment = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update. Choose approved or rejected.' });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('plan')
      .populate('user');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This payment has already been processed' });
    }

    const user = await User.findById(payment.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User associated with this payment not found' });
    }

    if (status === 'approved') {
      const receiptNumber = `SRFH-${Date.now().toString().slice(-8)}`;

      payment.status = 'approved';
      payment.receiptNumber = receiptNumber;
      await payment.save();

      // Calculate membership expiry dates
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + payment.plan.durationMonths);

      user.membershipPlan = payment.plan._id;
      user.membershipStatus = 'active';
      user.membershipStart = startDate;
      user.membershipExpiry = expiryDate;

      // Add approval notification
      user.notifications.push({
        message: `Your payment for "${payment.plan.name}" has been approved! Your membership is now active until ${expiryDate.toLocaleDateString()}. Receipt: ${receiptNumber}`,
        read: false
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Payment approved, membership activated successfully.',
        payment
      });
    } else {
      // status === 'rejected'
      if (!rejectionReason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required' });
      }

      payment.status = 'rejected';
      payment.rejectionReason = rejectionReason;
      await payment.save();

      // Reset membership status to inactive if not already active
      if (user.membershipStatus === 'pending') {
        user.membershipStatus = 'inactive';
      }

      // Add rejection notification
      user.notifications.push({
        message: `Your payment of ₹${payment.amount} has been rejected. Reason: ${rejectionReason}. Please re-submit correct details.`,
        read: false
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Payment rejected, user notified.',
        payment
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error processing payment verification' });
  }
};

module.exports = {
  submitPayment,
  getMemberPayments,
  getAllPayments,
  verifyPayment
};
