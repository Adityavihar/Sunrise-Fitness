import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiActivity,
  FiInstagram, FiFacebook, FiYoutube, FiMessageSquare
} from 'react-icons/fi';

export default function Contact() {
  const { addToast } = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchContactConfig();
  }, []);

  const fetchContactConfig = async () => {
    try {
      const res = await api.get('/contact');
      if (res.data.success) {
        setConfig(res.data.config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please complete all fields', 'error');
      return;
    }
    setSending(true);
    setTimeout(() => {
      addToast('Thank you! Your feedback message has been received.', 'success');
      setFormData({ name: '', email: '', message: '' });
      setSending(false);
    }, 1000);
  };

  const contacts = config || {
    address: 'Kapilivaivari Street, infront of Seshadri Sadan, Annavarm, 533406',
    phone: '9299999288',
    email: 'contact@sunrisefitnesshub.com',
    whatsapp: '9299999288',
    googleMapsLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3811.8354966699313!2d82.502804!3d17.279612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39f60d3d5fbfab%3A0xe54bb39f67aee186!2sAnnavaram%2C%20Andhra%20Pradesh%20533406!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin',
    openingHours: 'Mon-Sat: 5:00 AM - 10:00 PM, Sun: 6:00 AM - 12:00 PM',
    socialMedia: { instagram: '', facebook: '', youtube: '' }
  };

  // Convert link to embed link if standard google maps link
  const mapSrc = contacts.googleMapsLink && contacts.googleMapsLink.includes('embed')
    ? contacts.googleMapsLink
    : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3811.8354966699313!2d82.502804!3d17.279612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39f60d3d5fbfab%3A0xe54bb39f67aee186!2sAnnavaram%2C%20Andhra%20Pradesh%20533406!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">Contact Us</span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Gym Locations</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
          Have questions or want to tour the facilities? Find our locations and contact paths below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contacts details Card (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <FiActivity className="text-gold-500" />
            Sunrise Fitness Hub
          </h3>

          <div className="flex flex-col gap-5 text-left">
            <div className="flex gap-3 items-start">
              <FiMapPin className="text-gold-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500">Physical Address</span>
                <p className="text-xs text-white leading-relaxed mt-0.5">{contacts.address}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <FiPhone className="text-gold-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500">Mobile & WhatsApp</span>
                <p className="text-xs text-white mt-0.5">{contacts.phone} / {contacts.whatsapp}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <FiMail className="text-gold-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500">Support Email</span>
                <p className="text-xs text-white mt-0.5">{contacts.email}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <FiClock className="text-gold-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500">Opening Hours</span>
                <p className="text-xs text-white leading-relaxed mt-0.5">{contacts.openingHours}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 my-2"></div>

          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500">Follow us on Socials</span>
            <div className="flex gap-3 mt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gold-500 transition-colors">
                <FiInstagram />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gold-500 transition-colors">
                <FiFacebook />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gold-500 transition-colors">
                <FiYoutube />
              </a>
            </div>
          </div>
        </div>

        {/* Map and Form (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Map */}
          <div className="glass-panel overflow-hidden rounded-2xl border border-white/5 h-64 shadow-lg relative">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(100%)' }}
              allowFullScreen=""
              loading="lazy"
              title="Gym Map location"
            ></iframe>
          </div>

          {/* Contact Inquiry form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiMessageSquare className="text-gold-500" />
              Write feedback or inquiry
            </h3>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="Write your feedback message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold uppercase transition-colors cursor-pointer self-start disabled:opacity-50"
              >
                {sending ? 'Submitting...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
