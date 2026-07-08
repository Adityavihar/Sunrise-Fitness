import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiUser, FiMail, FiPhone, FiInfo, FiCamera, FiCheckCircle } from 'react-icons/fi';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState(user?.profilePicture || '');
  const [fileObject, setFileObject] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      age: user?.age || '',
      gender: user?.gender || '',
      height: user?.height || '',
      weight: user?.weight || ''
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be under 5MB', 'error');
        return;
      }
      setFileObject(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('age', data.age);
    formData.append('gender', data.gender);
    formData.append('height', data.height);
    formData.append('weight', data.weight);

    if (fileObject) {
      formData.append('profilePicture', fileObject);
    }

    const result = await updateProfile(user._id, formData);
    setLoading(false);

    if (result.success) {
      addToast('Profile updated successfully!', 'success');
      setFileObject(null);
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Col 1: Summary Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center justify-between">
        <div className="w-full flex flex-col items-center">
          
          {/* Profile Picture Uploader */}
          <div className="relative w-28 h-28 rounded-full border-2 border-gold-500/30 overflow-hidden flex items-center justify-center mb-4 group bg-gym-gray">
            {imgPreview ? (
              <img src={imgPreview} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-2xl font-bold text-gold-500">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            )}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs cursor-pointer transition-opacity duration-300">
              <FiCamera className="text-xl mb-1 text-gold-500" />
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <h3 className="text-lg font-bold text-white uppercase font-display">{user?.name}</h3>
          <span className="text-[10px] uppercase font-bold text-gold-500 tracking-wider mt-1">{user?.role}</span>

          {/* Membership Brief Info */}
          <div className="w-full h-px bg-white/5 my-6"></div>

          <div className="w-full flex flex-col gap-4 text-left">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Active Plan</span>
              <p className="text-xs font-bold text-white uppercase mt-1">
                {user?.membershipPlan ? user.membershipPlan.name : 'No plan selected'}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Status</span>
              <span className={`inline-flex items-center gap-1.5 text-xs mt-1 capitalize font-semibold ${
                user?.membershipStatus === 'active' ? 'text-green-500' : 'text-yellow-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user?.membershipStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                {user?.membershipStatus || 'Inactive'}
              </span>
            </div>
            {user?.membershipStatus === 'active' && (
              <>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Start Date</span>
                  <p className="text-xs text-gray-300 mt-1">
                    {user.membershipStart ? new Date(user.membershipStart).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Expiry Date</span>
                  <p className="text-xs text-gray-300 mt-1">
                    {user.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-[10px] text-gray-500 text-left border-t border-white/5 pt-4 w-full mt-6 flex items-center gap-2">
          <FiCheckCircle className="text-gold-500 text-xs flex-shrink-0" />
          <span>Profile verified under Sunrise Fitness Hub.</span>
        </div>
      </div>

      {/* Col 2 & 3: Editing Form */}
      <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <FiInfo className="text-gold-500 text-lg" />
          Edit Profile Information
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
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
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
              {errors.name && <span className="text-[10px] text-red-500 mt-1 block">{errors.name.message}</span>}
            </div>

            {/* Email (Read Only in Profile Edit to keep it verified) */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Email Address (Read-Only)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                  <FiMail />
                </span>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-dark/20 border border-white/5 text-xs text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
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
                    required: 'Phone is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Must be exactly 10 digits'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
              {errors.phone && <span className="text-[10px] text-red-500 mt-1 block">{errors.phone.message}</span>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Age
              </label>
              <input
                type="number"
                {...register('age', {
                  min: { value: 12, message: 'Min age is 12' },
                  max: { value: 100, message: 'Max age is 100' }
                })}
                placeholder="Enter age"
                className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
              />
              {errors.age && <span className="text-[10px] text-red-500 mt-1 block">{errors.age.message}</span>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Gender
              </label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none cursor-pointer"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                  Height (cm)
                </label>
                <input
                  type="number"
                  {...register('height', { min: { value: 50, message: 'Height invalid' } })}
                  placeholder="Height"
                  className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
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
                  className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white tracking-wider uppercase transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 cursor-pointer disabled:opacity-50 w-full sm:w-auto self-start mt-4"
          >
            {loading ? 'Saving changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

    </div>
  );
}
