const User = require('../models/User');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');

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

    // 2. Revenue Calculation
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Monthly Revenue History (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
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
      name: plansMap[item._id.toString()] || 'Unknown Plan',
      value: item.value
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
        totalRevenue
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

module.exports = {
  getDashboardStats
};
