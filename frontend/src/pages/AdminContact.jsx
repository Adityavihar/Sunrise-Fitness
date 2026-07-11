import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageCompressor';
import { FiSettings, FiCheckCircle, FiCamera, FiUpload } from 'react-icons/fi';

export default function AdminContact() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    googleMapsLink: '',
    openingHours: '',
    instagram: '',
    facebook: '',
    youtube: ''
  });

  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');

  useEffect(() => {
    fetchContactConfig();
  }, []);

  const fetchContactConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact');
      if (res.data.success) {
        const c = res.data.config;
        setFormData({
          address: c.address || '',
          phone: c.phone || '',
          email: c.email || '',
          whatsapp: c.whatsapp || '',
          googleMapsLink: c.googleMapsLink || '',
          openingHours: c.openingHours || '',
          instagram: c.socialMedia?.instagram || '',
          facebook: c.socialMedia?.facebook || '',
          youtube: c.socialMedia?.youtube || ''
        });
        setQrPreview(c.qrCode || '');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve contact configuration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    let finalQrFile = qrFile;
    if (qrFile && qrFile.size > 150 * 1024) {
      try {
        finalQrFile = await compressImage(qrFile, 1200, 1200, 0.85);
      } catch (err) {
        console.error('QR code image compression failed:', err);
      }
    }

    const data = new FormData();
    data.append('address', formData.address);
    data.append('phone', formData.phone);
    data.append('email', formData.email);
    data.append('whatsapp', formData.whatsapp);
    data.append('googleMapsLink', formData.googleMapsLink);
    data.append('openingHours', formData.openingHours);
    data.append('instagram', formData.instagram);
    data.append('facebook', formData.facebook);
    data.append('youtube', formData.youtube);

    if (finalQrFile) {
      data.append('qrCode', finalQrFile);
    }

    try {
      const res = await api.put('/contact', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setQrFile(null);
        fetchContactConfig();
      }
    } catch (err) {
      addToast('Error updating contact information.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 mx-auto text-left">
      <h3 className="text-base font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
        <FiSettings className="text-red-500" />
        Gym Contact Configuration
      </h3>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Phone Contact *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Gym Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">WhatsApp Line</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Opening Hours Schedule</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Gym Address *</label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
            />
          </div>

          {/* Maps Link */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Google Maps Link / Embed Link</label>
            <input
              type="text"
              value={formData.googleMapsLink}
              onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
              placeholder="Google Maps source URL"
              className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="h-px bg-white/5 my-2"></div>

          {/* Socials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Instagram Profile Link</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="instagram.com/profile"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Facebook Page Link</label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="facebook.com/page"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">YouTube Channel Link</label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="youtube.com/channel"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* QR Code Scanner Image Uploader */}
          <div className="h-px bg-white/5 my-2"></div>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-40 h-40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center bg-gym-dark/50 relative group">
              {qrPreview ? (
                <img src={qrPreview} alt="QR Scanner Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-gray-500 text-[10px] text-center p-4">
                  No QR Code scanner uploaded yet.
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs cursor-pointer transition-opacity duration-300">
                <FiCamera className="text-xl mb-1 text-red-500" />
                Upload QR Scanner
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-left flex-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Gym QR Code Scanner</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-light">
                Upload your GPay, PhonePe, Paytm, or generic UPI merchant QR code scanner image. Members will scan this exact image on the checkout/payment page to submit their membership fees.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white tracking-wider uppercase transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {updating ? 'Updating configuration parameters...' : 'Save Configuration details'}
          </button>
        </form>
      )}

    </div>
  );
}
