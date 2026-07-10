import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiActivity, FiUser } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    
    // If not on landing page, navigate to "/" first and then scroll
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'About', target: 'about' },
    { name: 'Why Us', target: 'why-us' },
    { name: 'Plans', target: 'plans' },
    { name: 'Supplements', target: 'supplements' },
    { name: 'Gallery', target: 'gallery' },
    { name: 'Contact', target: 'contact' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
        isScrolled || isOpen
          ? 'bg-gym-dark/95 border-b border-white/5 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center group-hover:border-gold-500 transition-colors duration-300">
            <FiActivity className="text-gold-500 text-xl group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-wider text-white">
              SUNRISE <span className="text-gold-500">FITNESS</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-gray-400 -mt-1">
              Hub & Training Center
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => handleNavClick(link.target)}
              className="text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-300 cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold-500/30 hover:border-gold-500 text-sm font-semibold text-gold-500 hover:bg-gold-500/5 transition-all duration-300"
            >
              <FiUser />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-sm font-semibold text-white shadow-lg hover:shadow-red-600/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Menu Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white hover:text-gold-500 transition-colors p-2"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden w-full bg-gym-dark/98 border-b border-white/5 px-6 py-8 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  onClick={() => handleNavClick(link.target)}
                  className="text-left text-base font-semibold text-gray-300 hover:text-gold-500 transition-colors py-1 cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="w-full h-px bg-white/5 my-2"></div>

            <div className="flex flex-col gap-4">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gold-500/30 text-gold-500 font-semibold"
                >
                  <FiUser />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-3 text-gray-300 hover:text-white font-semibold"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-3 rounded-xl bg-red-600 text-white font-semibold"
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
