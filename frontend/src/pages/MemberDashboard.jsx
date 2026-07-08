import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiActivity, FiCalendar, FiClock, FiPlusCircle, FiTrendingUp,
  FiShoppingBag, FiCreditCard, FiUser, FiInfo
} from 'react-icons/fi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function MemberDashboard() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [newWeight, setNewWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Expiry Calculations
  const calculateDaysRemaining = () => {
    if (!user?.membershipExpiry || user.membershipStatus !== 'active') return 0;
    const diffTime = new Date(user.membershipExpiry) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysRemaining();

  // BMI Category Calculator
  const getBmiCategory = (bmi) => {
    if (!bmi) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBmiColor = (bmi) => {
    if (!bmi) return 'text-gray-400';
    if (bmi < 18.5) return 'text-blue-400';
    if (bmi < 25) return 'text-green-500';
    if (bmi < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const currentBmi = user?.bmiHistory && user.bmiHistory.length > 0
    ? user.bmiHistory[user.bmiHistory.length - 1].bmi
    : null;

  const currentWeight = user?.weight || 'N/A';

  // Weight Logging Handler
  const handleWeightLog = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight) || Number(newWeight) <= 0) {
      addToast('Please enter a valid weight in kg', 'error');
      return;
    }
    
    setIsLogging(true);
    const result = await updateProfile(user._id, { weight: Number(newWeight) });
    setIsLogging(false);

    if (result.success) {
      addToast('Weight logged and BMI updated successfully!', 'success');
      setNewWeight('');
    } else {
      addToast(result.message, 'error');
    }
  };

  // Format chart logs
  const weightChartData = user?.bmiHistory && user.bmiHistory.length > 0
    ? user.bmiHistory.slice(-7).map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Weight: item.weight,
        BMI: item.bmi
      }))
    : [];

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-gold-500/10 to-transparent pointer-events-none" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">Workspace Dashboard</span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl font-light">
          Your fitness program is active. Stay consistent, log metrics daily, and fuel correctly to accelerate your progression.
        </p>
      </div>

      {/* 2. Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card A: Membership status */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Membership Status</h3>
            <FiCalendar className="text-gold-500 text-lg" />
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              user?.membershipStatus === 'active'
                ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                : user?.membershipStatus === 'pending'
                ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 animate-pulse'
                : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}>
              {user?.membershipStatus || 'Inactive'}
            </span>
            {user?.membershipStatus === 'active' ? (
              <p className="text-2xl font-black text-white mt-4 font-display">
                {daysLeft} <span className="text-sm text-gray-400 font-bold uppercase">Days Left</span>
              </p>
            ) : (
              <div className="mt-4">
                <Link to="/plans" className="text-xs font-bold text-gold-500 hover:underline flex items-center gap-1.5">
                  Activate Subscription
                  <FiCreditCard />
                </Link>
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-500 border-t border-white/5 pt-3 mt-4">
            {user?.membershipExpiry
              ? `Expires: ${new Date(user.membershipExpiry).toLocaleDateString()}`
              : 'No subscription active.'}
          </div>
        </div>

        {/* Card B: BMI Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">BMI Index</h3>
            <FiActivity className="text-gold-500 text-lg" />
          </div>
          <div>
            <span className={`text-2xl font-black text-white font-display`}>
              {currentBmi || 'N/A'}{' '}
              {currentBmi && (
                <span className={`text-xs font-bold uppercase tracking-wider ${getBmiColor(currentBmi)}`}>
                  ({getBmiCategory(currentBmi)})
                </span>
              )}
            </span>
            <p className="text-[10px] text-gray-400 leading-normal mt-2 font-light">
              {user?.height ? `Height: ${user.height}cm` : 'Height profile empty.'}{' '}
              {user?.weight ? `• Weight: ${user.weight}kg` : 'Weight profile empty.'}
            </p>
          </div>
          <div className="text-[10px] text-gray-500 border-t border-white/5 pt-3 mt-4">
            BMI is auto-updated when you log new weight logs.
          </div>
        </div>

        {/* Card C: Quick Weight Log */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Log Today's Weight</h3>
            <FiPlusCircle className="text-gold-500 text-lg" />
          </div>
          <form onSubmit={handleWeightLog} className="flex gap-2">
            <input
              type="text"
              required
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="e.g. 74.5"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLogging}
              className="px-4 py-2.5 rounded-xl bg-gold-500 text-black text-xs font-bold uppercase cursor-pointer disabled:opacity-50 hover:bg-gold-400 transition-colors"
            >
              Log
            </button>
          </form>
          <div className="text-[10px] text-gray-500 border-t border-white/5 pt-3 mt-4">
            Last logged: {currentWeight} kg
          </div>
        </div>

      </div>

      {/* 3. Weight progress Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column (2 cols width) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <FiTrendingUp className="text-gold-500 text-lg" />
              Weight Progression (Last 7 Logs)
            </h3>
          </div>
          <div className="h-64 w-full">
            {weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Weight" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gym-gray/20 rounded-xl border border-dashed border-white/5">
                <FiInfo className="text-2xl text-gray-500 mb-2" />
                <p className="text-xs text-gray-400 font-light">
                  No weight history logged yet. Log today's weight to initialize your metrics tracking chart.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Column (1 col width) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Quick Navigation</h3>
          
          <Link
            to="/profile"
            className="flex items-center justify-between p-3.5 rounded-xl bg-gym-gray/60 border border-white/5 hover:border-gold-500/30 transition-all duration-300 text-sm font-semibold text-white group"
          >
            <span className="flex items-center gap-3">
              <FiUser className="text-gold-500 text-lg group-hover:scale-110 transition-transform" />
              Update Profile Details
            </span>
            <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
          </Link>

          <Link
            to="/supplements"
            className="flex items-center justify-between p-3.5 rounded-xl bg-gym-gray/60 border border-white/5 hover:border-gold-500/30 transition-all duration-300 text-sm font-semibold text-white group"
          >
            <span className="flex items-center gap-3">
              <FiShoppingBag className="text-gold-500 text-lg group-hover:scale-110 transition-transform" />
              Supplements Store
            </span>
            <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
          </Link>

          <Link
            to="/payment"
            className="flex items-center justify-between p-3.5 rounded-xl bg-gym-gray/60 border border-white/5 hover:border-gold-500/30 transition-all duration-300 text-sm font-semibold text-white group"
          >
            <span className="flex items-center gap-3">
              <FiCreditCard className="text-gold-500 text-lg group-hover:scale-110 transition-transform" />
              Pay Subscriptions (QR scan)
            </span>
            <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
