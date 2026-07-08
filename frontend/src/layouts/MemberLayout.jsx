import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiGrid, FiUser, FiCreditCard, FiShoppingBag, FiImage,
  FiMail, FiLogOut, FiMenu, FiX, FiBell, FiActivity, FiHome
} from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Membership Plans', path: '/plans', icon: FiCreditCard },
    { name: 'Submit Payment', path: '/payment', icon: FiCreditCard },
    { name: 'Supplements Store', path: '/supplements', icon: FiShoppingBag },
    { name: 'Gallery', path: '/gallery', icon: FiImage },
    { name: 'Contact Gym', path: '/contact', icon: FiMail }
  ];

  const unreadNotifCount = user?.notifications?.filter(n => !n.read).length || 0;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gym-gray border-r border-white/5 py-6">
      {/* Header Info */}
      <div className="px-6 mb-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
            <FiActivity className="text-gold-500 text-lg" />
          </div>
          <div>
            <span className="font-display font-black text-sm tracking-wider text-white">
              SUNRISE <span className="text-gold-500">FITNESS</span>
            </span>
            <span className="block text-[8px] uppercase tracking-widest text-gray-400 -mt-1">
              Member Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* User Short Info */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-gold-500/30 bg-gym-card overflow-hidden flex-shrink-0 flex items-center justify-center">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-sm font-bold text-gold-500">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="overflow-hidden">
          <h4 className="text-xs font-semibold text-white truncate">{user?.name}</h4>
          <span className="text-[10px] text-gold-500 capitalize flex items-center gap-1 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${user?.membershipStatus === 'active' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
            {user?.membershipStatus}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          <FiHome className="text-lg text-gray-500" />
          Landing Page
        </Link>
        
        <div className="h-px bg-white/5 my-2"></div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/10 to-gold-500/0 border-l-2 border-gold-500 text-gold-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="text-lg" />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/5 transition-all duration-300"
        >
          <FiLogOut className="text-lg" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gym-dark flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Dashboard Banner */}
        <header className="h-20 bg-gym-gray/50 border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Mobile hamburger trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FiMenu size={24} />
          </button>

          <h2 className="text-lg font-bold text-white hidden md:block tracking-wide">
            Sunrise Fitness Workspace
          </h2>

          {/* Right Header Panel */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="w-10 h-10 rounded-full border border-white/5 hover:border-gold-500/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative"
              >
                <FiBell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              <AnimatePresence>
                {showNotif && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-gym-card border border-white/10 rounded-xl shadow-2xl z-50 p-4 max-h-[350px] overflow-y-auto"
                    >
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                        Notifications
                      </h4>
                      <div className="flex flex-col gap-2">
                        {user?.notifications && user.notifications.length > 0 ? (
                          [...user.notifications].reverse().map((notif, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-gym-gray/60 border border-white/5">
                              <p className="text-xs text-gray-300 leading-normal">{notif.message}</p>
                              <span className="text-[9px] text-gray-500 mt-1 block">
                                {new Date(notif.date).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 py-4 text-center">No notifications yet.</p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Summary */}
            <Link to="/profile" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.name}</p>
                <span className="text-[10px] text-gray-400 capitalize">{user?.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/30 overflow-hidden flex items-center justify-center">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-sm font-bold text-gold-500">
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
