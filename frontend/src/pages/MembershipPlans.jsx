import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiCheck, FiInfo, FiCreditCard } from 'react-icons/fi';

export default function MembershipPlans() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans');
        if (res.data.success) {
          setPlans(res.data.plans);
        }
      } catch (err) {
        console.error(err);
        addToast('Failed to retrieve plans listing.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    if (!user) {
      addToast('Please login to subscribe to a plan', 'info');
      navigate('/login');
    } else {
      navigate('/payment', { state: { selectedPlan: plan } });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">Subscriptions</span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Membership Plans</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
          Review our flexible membership tiers below. Find the schedule that works for your fitness goals.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={plan._id}
              className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between relative group hover:border-gold-500/30 transition-colors duration-300"
            >
              {plan.durationMonths === 12 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-500 text-black text-[9px] font-black uppercase tracking-widest shadow-md">
                  Best Value
                </span>
              )}
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
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  plan.durationMonths === 12
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-gold-500/30'
                }`}
              >
                Choose Subscription
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center py-12">
          <FiInfo className="text-gray-500 text-3xl mb-2" />
          <p className="text-sm text-gray-400 font-light">No membership plans are currently active in our catalog.</p>
        </div>
      )}
    </div>
  );
}
