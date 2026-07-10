const User = require('../models/User');

// @desc    Get all members (Admin only)
// @route   GET /api/members
// @access  Private/Admin
const getAllMembers = async (req, res) => {
  try {
    const { search, status, role } = req.query;
    let query = { role: 'member' }; // Default to members only

    if (role) {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.membershipStatus = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await User.find(query)
      .select('-password')
      .populate('membershipPlan')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: members.length, members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving members list' });
  }
};

// @desc    Get member profile by ID (Admin only)
// @route   GET /api/members/:id
// @access  Private/Admin
const getMemberById = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password').populate('membershipPlan');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.status(200).json({ success: true, member });
  } catch (error) {
    console.error('Get member by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving member details' });
  }
};

// @desc    Update profile info (Member edits self, Admin edits anyone)
// @route   PUT /api/members/:id
// @access  Private
const updateMember = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check permissions: Admin can edit any, Member can only edit their own profile
    console.log('Update member request - ID:', userId, 'Body:', req.body, 'Auth User Role:', req.user.role);
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile update request' });
    }

    const { name, email, phone, age, gender, height, weight } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Email/Phone uniqueness check if they are changing
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
      user.email = email.toLowerCase();
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ success: false, message: 'Phone number already in use' });
      }
      user.phone = phone;
    }

    user.name = name || user.name;
    user.age = age !== undefined ? Number(age) : user.age;
    user.gender = gender !== undefined ? gender : user.gender;

    // Handle height / weight changes to update BMI history
    const oldHeight = user.height;
    const oldWeight = user.weight;

    user.height = height !== undefined ? Number(height) : user.height;
    user.weight = weight !== undefined ? Number(weight) : user.weight;

    if (height !== undefined || weight !== undefined) {
      const currentHeight = user.height;
      const currentWeight = user.weight;

      if (currentHeight && currentWeight && (currentHeight !== oldHeight || currentWeight !== oldWeight)) {
        const heightInM = currentHeight / 100;
        const bmi = currentWeight / (heightInM * heightInM);
        const formattedBmi = Math.round(bmi * 10) / 10;

        // Check if we already logged BMI today, if so update it, else push
        const today = new Date().toDateString();
        const loggedTodayIndex = user.bmiHistory.findIndex(log => new Date(log.date).toDateString() === today);

        if (loggedTodayIndex >= 0) {
          user.bmiHistory[loggedTodayIndex].bmi = formattedBmi;
          user.bmiHistory[loggedTodayIndex].weight = currentWeight;
        } else {
          user.bmiHistory.push({ bmi: formattedBmi, weight: currentWeight });
        }
      }
    }

    // Profile photo upload if applicable
    if (req.file) {
      const { getFileUrl } = require('../middleware/uploadMiddleware');
      user.profilePicture = getFileUrl(req.file, req);
    }

    // Admin-only updates: Direct status toggle and password reset
    if (req.user.role === 'admin') {
      if (req.body.membershipStatus) {
        user.membershipStatus = req.body.membershipStatus;
      }
      if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating profile' });
  }
};

// @desc    Suspend member (Admin only)
// @route   PUT /api/members/:id/suspend
// @access  Private/Admin
const suspendMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const { status } = req.body; // 'suspended' or 'inactive' to lift suspension
    const activeStatus = status === 'suspended' ? 'suspended' : 'inactive';

    user.membershipStatus = activeStatus;
    
    if (activeStatus === 'suspended') {
      user.refreshToken = null; // Force logout on token refresh
      user.notifications.push({
        message: 'Your account has been suspended by an administrator. Please reach out to customer support.',
        read: false
      });
    } else {
      user.notifications.push({
        message: 'Your suspension has been lifted. You can now subscribe or use your account.',
        read: false
      });
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: `User status changed to ${activeStatus}`,
      user
    });
  } catch (error) {
    console.error('Suspend member error:', error);
    res.status(500).json({ success: false, message: 'Server error changing user suspension status' });
  }
};

// @desc    Extend / Modify membership dates manually (Admin only)
// @route   PUT /api/members/:id/extend
// @access  Private/Admin
const extendMembership = async (req, res) => {
  try {
    const { months } = req.body;
    if (!months || isNaN(months)) {
      return res.status(400).json({ success: false, message: 'Please specify correct extension duration in months' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const extensionMonths = Number(months);
    let expiry = user.membershipExpiry ? new Date(user.membershipExpiry) : new Date();

    // If membership was expired or null, set start from today
    if (!user.membershipExpiry || new Date(user.membershipExpiry) < new Date()) {
      user.membershipStart = new Date();
      expiry = new Date();
    }

    expiry.setMonth(expiry.getMonth() + extensionMonths);
    user.membershipExpiry = expiry;
    user.membershipStatus = 'active';

    user.notifications.push({
      message: `Your membership has been extended manually by ${extensionMonths} months by the admin. It is now active until ${expiry.toLocaleDateString()}.`,
      read: false
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: `Membership extended by ${extensionMonths} months successfully`,
      user
    });
  } catch (error) {
    console.error('Extend membership error:', error);
    res.status(500).json({ success: false, message: 'Server error extending membership' });
  }
};

// @desc    Delete member (Admin only)
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting member account' });
  }
};

// @desc    Export members to CSV (Admin only)
// @route   GET /api/members/export/csv
// @access  Private/Admin
const exportMembersCsv = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const members = await User.find({ role: 'member' }).populate('membershipPlan');

    // Create CSV header
    let csvContent = 'Name,Email,Phone,Age,Gender,Status,Membership Plan,Period (Start),Period (Expiry),Amount to be Paid,Paid Status,Payment Submission Date,Payment Submission Day,Payment Submission Time,Last Payment Ref,Login Times History,Logout Times History\n';

    // Populate lines
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const planName = member.membershipPlan ? member.membershipPlan.name : 'None';
      const start = member.membershipStart ? new Date(member.membershipStart).toLocaleDateString() : 'N/A';
      const expiry = member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString() : 'N/A';

      // Find the latest payment record for this user
      const payment = await Payment.findOne({ user: member._id }).populate('plan').sort({ createdAt: -1 });

      let paidStatus = 'Unpaid';
      let amount = member.membershipPlan ? member.membershipPlan.price : 0;
      let payDateStr = 'N/A';
      let payDayStr = 'N/A';
      let payTimeStr = 'N/A';
      let upiRef = 'N/A';

      if (payment) {
        amount = payment.amount;
        upiRef = payment.upiTransactionId || 'N/A';
        if (payment.status === 'approved') {
          paidStatus = 'Paid (Approved)';
        } else if (payment.status === 'pending') {
          paidStatus = 'Pending Verification';
        } else if (payment.status === 'rejected') {
          paidStatus = 'Rejected (Unpaid)';
        }

        if (payment.createdAt) {
          const pDate = new Date(payment.createdAt);
          payDateStr = pDate.toLocaleDateString();
          payDayStr = pDate.toLocaleDateString(undefined, { weekday: 'long' });
          payTimeStr = pDate.toLocaleTimeString();
        }
      }

      // Format login/logout histories (removing commas to prevent CSV breaking)
      const loginLogs = member.sessionLogs && member.sessionLogs.length > 0
        ? member.sessionLogs.map(log => new Date(log.loginTime).toLocaleString().replace(/,/g, '')).join('; ')
        : 'No logins recorded';

      const logoutLogs = member.sessionLogs && member.sessionLogs.length > 0
        ? member.sessionLogs.map(log => log.logoutTime ? new Date(log.logoutTime).toLocaleString().replace(/,/g, '') : 'Active/Not Logged Out').join('; ')
        : 'No logouts recorded';

      const row = [
        `"${member.name.replace(/"/g, '""')}"`,
        `"${member.email.replace(/"/g, '""')}"`,
        `"${member.phone.replace(/"/g, '""')}"`,
        member.age || 'N/A',
        member.gender || 'N/A',
        member.membershipStatus,
        `"${planName.replace(/"/g, '""')}"`,
        `"${start}"`,
        `"${expiry}"`,
        amount,
        `"${paidStatus}"`,
        `"${payDateStr}"`,
        `"${payDayStr}"`,
        `"${payTimeStr}"`,
        `"${upiRef.replace(/"/g, '""')}"`,
        `"${loginLogs}"`,
        `"${logoutLogs}"`
      ].join(',');

      csvContent += row + '\n';
    }

    res.header('Content-Type', 'text/csv');
    res.attachment('sunrise_fitness_members_audit_sheet.csv');
    return res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ success: false, message: 'Server error exporting CSV file' });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  updateMember,
  suspendMember,
  extendMembership,
  deleteMember,
  exportMembersCsv
};
