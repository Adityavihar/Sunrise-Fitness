import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FiUsers, FiTrendingUp, FiCreditCard, FiClock, FiPlus,
  FiShoppingBag, FiImage, FiSettings, FiBarChart2
} from 'react-icons/fi';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    pendingPayments: 0,
    todayRegistrations: 0,
    totalRevenue: 0
  });

  const [charts, setCharts] = useState({
    revenueHistory: [],
    planDistribution: [],
    dailyRegistrations: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardReports();
  }, []);

  const fetchDashboardReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to compile dashboard reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#d4af37', '#e53e3e', '#3b82f6', '#10b981', '#8b5cf6'];

  const statsCards = [
    { label: 'Total Members', val: stats.totalMembers, icon: FiUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Members', val: stats.activeMembers, icon: FiUsers, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Expired memberships', val: stats.expiredMembers, icon: FiClock, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Pending Payments', val: stats.pendingPayments, icon: FiCreditCard, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Today\'s Registrations', val: stats.todayRegistrations, icon: FiPlus, color: 'text-gold-500', bg: 'bg-gold-500/10' },
    { label: 'Total Revenue', val: `₹${stats.totalRevenue}`, icon: FiTrendingUp, color: 'text-gold-500', bg: 'bg-gold-500/10' }
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-bold">Admin Panel</span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Management Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
          Review business health, handle registrations, verify subscription fees, and modify inventories.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {statsCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider leading-normal">
                      {card.label}
                    </span>
                    <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-4 font-display truncate">
                    {card.val}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Charts Row A */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Monthly Revenue (2 cols) */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiTrendingUp className="text-gold-500" />
                Monthly Revenue Analytics
              </h3>
              <div className="h-64 w-full">
                {charts.revenueHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminColorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e53e3e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#e53e3e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#e53e3e" strokeWidth={2} fillOpacity={1} fill="url(#adminColorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                    No approved revenue logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* Plans Distribution (1 col) */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiBarChart2 className="text-gold-500" />
                Membership Distribution
              </h3>
              <div className="h-48 w-full relative">
                {charts.planDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.planDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                    No members with active plans.
                  </div>
                )}
              </div>
              
              {/* Legends list */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[10px] justify-center">
                {charts.planDistribution.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="truncate max-w-[80px]">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Charts Row B & Quick navigations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Daily Registrations (2 cols) */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiUsers className="text-gold-500" />
                Daily Member Sign-ups (Last 7 Days)
              </h3>
              <div className="h-60 w-full">
                {charts.dailyRegistrations.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.dailyRegistrations} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="members" fill="#d4af37" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                    No sign-ups in the last 7 days.
                  </div>
                )}
              </div>
            </div>

            {/* Admin shortcuts (1 col) */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Shortcuts</h3>
              
              <Link to="/admin/members" className="flex items-center justify-between p-3.5 rounded-xl bg-gym-gray/60 border border-white/5 hover:border-red-500/30 transition-all text-xs font-semibold text-white group">
                <span className="flex items-center gap-3">
                  <FiUsers className="text-red-500 text-base" />
                  Customer Accounts
                </span>
                <span>→</span>
              </Link>

              <Link to="/admin/payments" className="flex items-center justify-between p-3.5 rounded-xl bg-gym-gray/60 border border-white/5 hover:border-red-500/30 transition-all text-xs font-semibold text-white group">
                <span className="flex items-center gap-3">
                  <FiCreditCard className="text-red-500 text-base" />
                  Payments Approval
                </span>
                <span>→</span>
              </Link>

              <Link to="/admin/plans" className="flex items-center justify-between p-3.5 rounded-xl bg-gym-gray/60 border border-white/5 hover:border-red-500/30 transition-all text-xs font-semibold text-white group">
                <span className="flex items-center gap-3">
                  <FiCreditCard className="text-red-500 text-base" />
                  Membership Plans Config
                </span>
                <span>→</span>
              </Link>

              <Link to="/admin/contact" className="flex items-center justify-between p-3.5 rounded-xl bg-gym-gray/60 border border-white/5 hover:border-red-500/30 transition-all text-xs font-semibold text-white group">
                <span className="flex items-center gap-3">
                  <FiSettings className="text-red-500 text-base" />
                  Gym physical details
                </span>
                <span>→</span>
              </Link>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
