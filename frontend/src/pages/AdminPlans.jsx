import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiInfo } from 'react-icons/fi';

export default function AdminPlans() {
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit states
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMonths: '1',
    benefits: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans');
      if (res.data.success) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load plans.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({ name: '', price: '', durationMonths: '1', benefits: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      durationMonths: String(plan.durationMonths),
      benefits: plan.benefits.join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"? This cannot be undone.`)) return;
    try {
      const res = await api.delete(`/plans/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchPlans();
      }
    } catch (err) {
      addToast('Failed to delete membership plan.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.durationMonths) {
      addToast('Please complete all required fields', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      durationMonths: Number(formData.durationMonths),
      benefits: formData.benefits
    };

    try {
      if (editingPlan) {
        // Edit
        const res = await api.put(`/plans/${editingPlan._id}`, payload);
        if (res.data.success) {
          addToast(res.data.message, 'success');
          setShowModal(false);
          fetchPlans();
        }
      } else {
        // Add
        const res = await api.post('/plans', payload);
        if (res.data.success) {
          addToast(res.data.message, 'success');
          setShowModal(false);
          fetchPlans();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing plans transaction', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-bold">Admin Hub</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Gym Subscriptions</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
            Configure active subscription blueprints, adjust prices, and declare member checklists.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/25"
        >
          <FiPlus />
          Add Membership Plan
        </button>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between relative group hover:border-red-500/25 transition-all duration-300"
            >
              <div>
                <h3 className="text-xl font-bold uppercase text-white tracking-wider mb-2 font-display">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-gold-500 font-display">₹{plan.price}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">/ {plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8">
                  {plan.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <FiCheck className="text-gold-500 text-sm flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-gold-500 text-xs font-bold text-gray-300 hover:text-gold-500 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan._id, plan.name)}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-red-500 text-xs font-bold text-red-500 transition-colors cursor-pointer"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center py-12">
          <FiInfo className="text-gray-500 text-3xl mb-2" />
          <p className="text-sm text-gray-400 font-light">No subscription blueprints defined yet.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-2xl border border-white/10 relative flex flex-col gap-4 text-left"
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">
              {editingPlan ? 'Edit subscription details' : 'Add new subscription plan'}
            </h3>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Plan Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Monthly Fitness, Quarterly Pro"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Price (INR) *</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Duration (Months) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                  placeholder="e.g. 3"
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Plan Benefits (Comma separated)
              </label>
              <textarea
                rows={3}
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="e.g. Free Wi-Fi, Locker Access, 1 Trainer Session"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase transition-colors shadow-lg mt-2"
            >
              {editingPlan ? 'Save Configurations' : 'Bootstrap Plan'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
