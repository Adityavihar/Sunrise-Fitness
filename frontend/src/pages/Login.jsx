import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiMail, FiLock, FiActivity, FiArrowLeft } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.identifier, data.password);
    setLoading(false);

    if (result.success) {
      addToast('Welcome back to Sunrise Fitness Hub!', 'success');
      // If remember me is set, handle it (e.g. locally, but auth tokens are always securely stored in HttpOnly cookies)
      if (data.rememberMe) {
        localStorage.setItem('sunrise_remembered_user', data.identifier);
      } else {
        localStorage.removeItem('sunrise_remembered_user');
      }
      
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gym-dark flex items-center justify-center relative p-6">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]" />

      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft />
          Back to Home
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/5 relative z-10">
        
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
            <FiActivity className="text-gold-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide">
            WELCOME BACK
          </h2>
          <p className="text-xs text-gray-400 mt-1">Sunrise Fitness Hub Member Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email or Phone Input */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
              Email Address or Phone *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <FiMail />
              </span>
              <input
                type="text"
                {...register('identifier', {
                  required: 'Email or Phone is required',
                  minLength: { value: 3, message: 'Must be at least 3 characters' }
                })}
                placeholder="Enter email or phone number"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
              />
            </div>
            {errors.identifier && (
              <span className="text-[10px] text-red-500 mt-1 block font-semibold">
                {errors.identifier.message}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
              Password *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <FiLock />
              </span>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required'
                })}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 mt-1 block font-semibold">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Option Toggles */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="rounded border-white/10 text-gold-500 bg-gym-gray focus:ring-0 w-4 h-4 cursor-pointer"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => addToast('Please contact the Gym Desk at 9299999288 to reset your password.', 'info')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white tracking-wider uppercase transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-500 hover:underline font-bold">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}
