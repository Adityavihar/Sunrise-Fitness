const User = require('../models/User');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const SystemConfig = require('../models/SystemConfig');

// @desc    Get dashboard metrics & statistical reports (Admin only)
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', membershipStatus: 'active' });
    const expiredMembers = await User.countDocuments({ role: 'member', membershipStatus: 'expired' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });

    // Today's registrations
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayRegistrations = await User.countDocuments({
      role: 'member',
      createdAt: { $gte: startOfToday }
    });

    // Check revenue reset timestamp from system configuration
    const systemConfig = await SystemConfig.findOne();
    const revenueResetDate = systemConfig?.revenueResetDate || null;

    // 2. Revenue Calculation (filtered by revenueResetDate if active)
    const revenueMatch = { status: 'approved' };
    if (revenueResetDate) {
      revenueMatch.$or = [
        { updatedAt: { $gt: revenueResetDate } },
        { createdAt: { $gt: revenueResetDate } }
      ];
    }

    const revenueResult = await Payment.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Monthly Revenue History (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyMatch = {
      status: 'approved',
      createdAt: { $gte: sixMonthsAgo }
    };
    if (revenueResetDate) {
      monthlyMatch.$or = [
        { updatedAt: { $gt: revenueResetDate } },
        { createdAt: { $gt: revenueResetDate } }
      ];
    }

    const monthlyRevenue = await Payment.aggregate([
      { $match: monthlyMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%b %Y', date: '$createdAt' } },
          dateRaw: { $min: '$createdAt' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { dateRaw: 1 } }
    ]);

    // Format monthly revenue for charts
    const revenueHistory = monthlyRevenue.map(item => ({
      month: item._id,
      revenue: item.revenue
    }));

    // 4. Membership Plans Distribution
    const planDistributionRaw = await User.aggregate([
      { $match: { role: 'member', membershipPlan: { $ne: null } } },
      {
        $group: {
          _id: '$membershipPlan',
          value: { $sum: 1 }
        }
      }
    ]);

    // Populate plan names manually to avoid ref query complexity in pipelines
    const plans = await Plan.find({}, '_id name');
    const plansMap = {};
    plans.forEach(p => {
      plansMap[p._id.toString()] = p.name;
    });

    const planDistribution = planDistributionRaw.map(item => ({
      name: item && item._id ? (plansMap[item._id.toString()] || 'Unknown Plan') : 'General Membership',
      value: item ? item.value : 0
    }));

    // 5. Daily Registrations (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const registrationsRaw = await User.aggregate([
      {
        $match: {
          role: 'member',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format daily registrations for chart
    const dailyRegistrations = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const match = registrationsRaw.find(r => r._id === dateString);
      dailyRegistrations.push({
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        members: match ? match.count : 0
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        expiredMembers,
        pendingPayments,
        todayRegistrations,
        totalRevenue,
        revenueResetDate
      },
      charts: {
        revenueHistory,
        planDistribution,
        dailyRegistrations
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error compiling report charts' });
  }
};

// @desc    Reset total revenue counter (Admin only)
// @route   POST /api/reports/reset-revenue
// @access  Private/Admin
const resetRevenue = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }
    const resetTimestamp = new Date();
    config.revenueResetDate = resetTimestamp;
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Total revenue counter has been reset to ₹0 successfully.',
      revenueResetDate: resetTimestamp
    });
  } catch (error) {
    console.error('Reset revenue error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting total revenue' });
  }
};

// @desc    Restore all-time revenue counter (Admin only)
// @route   POST /api/reports/restore-revenue
// @access  Private/Admin
const restoreRevenue = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (config) {
      config.revenueResetDate = null;
      await config.save();
    }

    res.status(200).json({
      success: true,
      message: 'All-time revenue counter restored successfully.',
      revenueResetDate: null
    });
  } catch (error) {
    console.error('Restore revenue error:', error);
    res.status(500).json({ success: false, message: 'Server error restoring revenue' });
  }
};

module.exports = {
  getDashboardStats,
  resetRevenue,
  restoreRevenue
};
