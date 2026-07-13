import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiUser, FiMail, FiPhone, FiLock, FiActivity, FiArrowLeft, FiCamera } from 'react-icons/fi';
import { compressImage } from '../utils/imageCompressor';

export default function Register() {
  const { register: registerAuth } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState('');
  const [fileObject, setFileObject] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      password: '',
      confirmPassword: ''
    }
  });

  const passwordVal = watch('password');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        addToast('File size must be under 25MB', 'error');
        return;
      }
      setFileObject(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    let finalFile = fileObject;
    if (fileObject && fileObject.size > 150 * 1024) {
      try {
        finalFile = await compressImage(fileObject, 800, 800, 0.8);
      } catch (err) {
        console.error('Registration profile image compression failed:', err);
      }
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('age', data.age);
    formData.append('gender', data.gender);
    formData.append('height', data.height);
    formData.append('weight', data.weight);
    formData.append('password', data.password);
    
    if (finalFile) {
      formData.append('profilePicture', finalFile);
    }

    const result = await registerAuth(formData);
    setLoading(false);

    if (result.success) {
      addToast(result.message, 'success');
      navigate('/login');
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

      {/* Registration Card */}
      <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl border border-white/5 relative z-10 my-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
            <FiActivity className="text-gold-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide">
            CREATE ACCOUNT
          </h2>
          <p className="text-xs text-gray-400 mt-1">Start your training journey with Sunrise Fitness Hub</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          {/* Profile Picture Uploader */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-gold-500/30 bg-gym-gray overflow-hidden flex items-center justify-center group">
              {imgPreview ? (
                <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <FiCamera className="text-2xl text-gray-500 group-hover:text-gold-500 transition-colors" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Upload Profile Photo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Full Name *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FiUser />
                </span>
                <input
                  type="text"
                  {...register('name', { required: 'Full name is required' })}
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              {errors.name && <span className="text-[10px] text-red-500 mt-1 block font-semibold">{errors.name.message}</span>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Email Address *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FiMail />
                </span>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address format'
                    }
                  })}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              {errors.email && <span className="text-[10px] text-red-500 mt-1 block font-semibold">{errors.email.message}</span>}
            </div>

            {/* Mobile No */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FiPhone />
                </span>
                <input
                  type="text"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Mobile number must be exactly 10 digits'
                    }
                  })}
                  placeholder="Enter 10-digit number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              {errors.phone && <span className="text-[10px] text-red-500 mt-1 block font-semibold">{errors.phone.message}</span>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Age
              </label>
              <input
                type="number"
                {...register('age', {
                  min: { value: 12, message: 'Minimum age is 12' },
                  max: { value: 100, message: 'Maximum age is 100' }
                })}
                placeholder="Enter age"
                className="w-full px-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
              />
              {errors.age && <span className="text-[10px] text-red-500 mt-1 block font-semibold">{errors.age.message}</span>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Gender
              </label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-gym-card">Select gender</option>
                <option value="male" className="bg-gym-card">Male</option>
                <option value="female" className="bg-gym-card">Female</option>
                <option value="other" className="bg-gym-card">Other</option>
              </select>
            </div>

            {/* Height / Weight grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                  Height (cm)
                </label>
                <input
                  type="number"
                  {...register('height', { min: { value: 50, message: 'Height invalid' } })}
                  placeholder="Height"
                  className="w-full px-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  {...register('weight', { min: { value: 20, message: 'Weight invalid' } })}
                  placeholder="Weight"
                  className="w-full px-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
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
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  placeholder="Enter strong password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              {errors.password && <span className="text-[10px] text-red-500 mt-1 block font-semibold">{errors.password.message}</span>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Confirm Password *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FiLock />
                </span>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === passwordVal || 'Passwords do not match'
                  })}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-500 mt-1 block font-semibold">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white tracking-wider uppercase transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-gold-500 hover:underline font-bold">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
