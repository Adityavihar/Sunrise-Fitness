const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public (active only) / Admin (all)
const getPlans = async (req, res) => {
  try {
    let filter = { isActive: true };

    // If request contains admin context (e.g. from admin panel), return all
    // We can check if req.user exists and role is admin
    if (req.user && req.user.role === 'admin') {
      filter = {};
    }

    const plans = await Plan.find(filter);
    res.status(200).json({ success: true, count: plans.length, plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving plans' });
  }
};

// @desc    Get single plan by ID
// @route   GET /api/plans/:id
// @access  Public
const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, plan });
  } catch (error) {
    console.error('Get plan by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving plan details' });
  }
};

// @desc    Create new membership plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const { name, price, durationMonths, benefits } = req.body;

    if (!name || !price || !durationMonths) {
      return res.status(400).json({ success: false, message: 'Please provide name, price, and duration' });
    }

    // Format benefits to array if it is a comma-separated string
    let benefitsArray = [];
    if (Array.isArray(benefits)) {
      benefitsArray = benefits;
    } else if (typeof benefits === 'string') {
      benefitsArray = benefits.split(',').map(b => b.trim()).filter(b => b);
    }

    const planExists = await Plan.findOne({ name });
    if (planExists) {
      return res.status(400).json({ success: false, message: 'A plan with this name already exists' });
    }

    const plan = await Plan.create({
      name,
      price: Number(price),
      durationMonths: Number(durationMonths),
      benefits: benefitsArray
    });

    res.status(201).json({ success: true, message: 'Plan created successfully', plan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ success: false, message: 'Server error creating plan' });
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  try {
    const { name, price, durationMonths, benefits, isActive } = req.body;

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Format benefits
    let benefitsArray = plan.benefits;
    if (benefits !== undefined) {
      if (Array.isArray(benefits)) {
        benefitsArray = benefits;
      } else if (typeof benefits === 'string') {
        benefitsArray = benefits.split(',').map(b => b.trim()).filter(b => b);
      }
    }

    plan.name = name || plan.name;
    plan.price = price !== undefined ? Number(price) : plan.price;
    plan.durationMonths = durationMonths !== undefined ? Number(durationMonths) : plan.durationMonths;
    plan.benefits = benefitsArray;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();
    res.status(200).json({ success: true, message: 'Plan updated successfully', plan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ success: false, message: 'Server error updating plan' });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await plan.deleteOne();
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting plan' });
  }
};

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
};
