import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiCheck, FiMapPin, FiPhone, FiMail, FiClock,
  FiAward, FiShield, FiHeart, FiTrendingUp, FiShoppingBag, FiInstagram, FiFacebook, FiYoutube
} from 'react-icons/fi';

import heroImg from '../assets/gym_hero_bg.jpg';

export default function LandingPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Dynamic States
  const [plans, setPlans] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [contact, setContact] = useState({});
  
  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch active items
    const fetchLandingData = async () => {
      try {
        const [plansRes, supRes, galRes, contactRes] = await Promise.allSettled([
          api.get('/plans'),
          api.get('/supplements?limit=3'),
          api.get('/gallery?limit=6'),
          api.get('/contact')
        ]);

        if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data.plans);
        if (supRes.status === 'fulfilled') setSupplements(supRes.value.data.products);
        if (galRes.status === 'fulfilled') setGallery(galRes.value.data.images);
        if (contactRes.status === 'fulfilled') setContact(contactRes.value.data.config);
      } catch (err) {
        console.error('Failed to load landing page records:', err);
      }
    };

    fetchLandingData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please fill out all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    // Simulate contact form submission
    setTimeout(() => {
      addToast('Thank you! Your query has been submitted successfully.', 'success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  // Fallbacks if data doesn't exist
  const defaultPlans = [
    { name: 'Monthly', price: 1500, durationMonths: 1, benefits: ['Full gym access', 'Locker facilities', '1 Trainer counseling session', 'Free Wi-Fi'] },
    { name: 'Quarterly', price: 4000, durationMonths: 3, benefits: ['Full gym access', 'Locker facilities', 'Personalized diet plans', '3 Trainer counseling sessions', 'Free Wi-Fi'] },
    { name: 'Half-Yearly', price: 7500, durationMonths: 6, benefits: ['Full gym access', 'Locker facilities', 'Personalized diet plans', '6 Trainer counseling sessions', '1 Supplement coupon', 'Free Wi-Fi'] },
    { name: 'Yearly Premium', price: 13000, durationMonths: 12, benefits: ['Full gym access', 'Locker facilities', 'Personalized diet plans', 'Dedicated Personal Trainer', 'Free access to gym events', 'Free Wi-Fi'] }
  ];

  const defaultSupplements = [
    { name: 'Pure Whey Gold Protein', category: 'Protein', price: 4999, image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=60', stock: 15 },
    { name: 'Micronized Creatine Powder', category: 'Creatine', price: 1299, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&auto=format&fit=crop&q=60', stock: 24 },
    { name: 'C4 Extreme Pre-Workout', category: 'Pre Workout', price: 2499, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60', stock: 8 }
  ];

  const defaultTrainers = [
    { name: 'Vikram Singh', specialty: 'Bodybuilding & Strength', cert: 'Gold medalist, IFBB Pro', img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=60' },
    { name: 'Rohan Sharma', specialty: 'Fat Loss & HIIT', cert: 'ACE Certified Personal Trainer', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=60' },
    { name: 'Anjali Sen', specialty: 'Yoga & Functional Mobility', cert: 'RYS 500 Advanced Yoga Specialist', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&auto=format&fit=crop&q=60' }
  ];

  const defaultGallery = [
    { imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=60', category: 'Gym' },
    { imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=60', category: 'Machines' },
    { imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=60', category: 'Workout Area' },
    { imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60', category: 'Transformations' }
  ];

  const testimonials = [
    { name: 'Amit Verma', change: 'Lost 22kg in 6 Months', quote: 'Sunrise Fitness Hub changed my life. The premium atmosphere, the dedicated coaches, and the support of the community are unmatched.', role: 'Business Owner' },
    { name: 'Kiran Reddy', change: 'Gained 8kg Lean Mass', quote: 'The best equipment in Annavarm. Very clean and professional. The diet planning and training guidance helped me surpass my strength goals.', role: 'Software Engineer' }
  ];

  const gymPlans = plans.length > 0 ? plans : defaultPlans;
  const storeSups = supplements.length > 0 ? supplements : defaultSupplements;
  const galImgs = gallery.length > 0 ? gallery : defaultGallery;
  const contacts = contact.address ? contact : {
    address: 'Kapilivaivari Street, infront of Seshadri Sadan, Annavarm, 533406',
    phone: '9299999288',
    email: 'contact@sunrisefitnesshub.com',
    whatsapp: '9299999288',
    googleMapsLink: 'https://maps.google.com',
    openingHours: 'Mon-Sat: 5:00 AM - 10:00 PM, Sun: 6:00 AM - 12:00 PM',
    socialMedia: { instagram: '', facebook: '', youtube: '' }
  };

  const handleJoinClick = (plan) => {
    if (!user) {
      addToast('Please login or create an account to select a plan', 'info');
      navigate('/login');
    } else {
      navigate('/payment', { state: { selectedPlan: plan } });
    }
  };

  return (
    <div className="relative">
      
      {/* 1. HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* Fullscreen Background */}
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Gym Hero" className="w-full h-full object-cover opacity-45 scale-105 animate-pulse-slow" />
          <div className="absolute inset-0 bg-gradient-to-t from-gym-dark via-gym-dark/60 to-black/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-bold uppercase tracking-widest mb-6">
              Build Your Ultimate Physique
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tight leading-none mb-6">
              SUNRISE <span className="gold-text-gradient">FITNESS</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              The premier fitness and strength training environment in Annavaram. Step into luxury space, expert coaching, and results-driven community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  const plansEl = document.getElementById('plans');
                  if (plansEl) plansEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold tracking-wide shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Join Today
                <FiArrowRight />
              </button>
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/30 font-bold transition-all duration-300 flex items-center justify-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/30 font-bold transition-all duration-300 flex items-center justify-center"
                >
                  Member Login
                </Link>
              )}
            </div>
          </motion.div>

          {/* Animated Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-20 pt-10 border-t border-white/5"
          >
            {[
              { num: '100+', label: 'Active Members' },
              { num: '50+', label: 'Imported Machines' },
              { num: '5.0★', label: 'Client Reviews' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <h3 className="text-2xl sm:text-4xl font-extrabold text-gold-500 font-display">{stat.num}</h3>
                <p className="text-[9px] sm:text-xs text-gray-400 mt-1 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT GYM */}
      <section id="about" className="py-24 bg-gym-dark relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">About Sunrise Fitness Hub</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-2 mb-6">
              AN ELITE ZONE DESIGNED TO PUSH LIMITS
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6 font-light">
              Sunrise Fitness Hub is more than just a gym; it is a movement center dedicated to enhancing physical efficiency and strength. Located in the heart of Annavaram, we offer an expansive workout arena equipped with cutting-edge international brands.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8 font-light text-sm">
              Whether you are an elite athlete aiming for professional milestones, a beginner trying to formulate healthier habits, or someone recovering from injury, our personalized programs are crafted to guide you to success.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500"><FiCheck /></div>
                <span className="text-sm font-semibold text-white">Imported Strength Equipment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500"><FiCheck /></div>
                <span className="text-sm font-semibold text-white">Dedicated HIIT & Cardio Deck</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60" alt="Gym training session" className="w-full h-full object-cover" />
            </div>
            {/* Float badge */}
            <div className="absolute -bottom-6 -left-6 bg-gym-gray border border-gold-500/30 p-5 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-3xl font-bold font-display">7+</div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Years of Experience</p>
                <span className="text-[10px] text-gray-400">Guiding Fitness Journeys</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section id="why-us" className="py-24 bg-gym-gray relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Why Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-2">
              OUR SERVICE PILLARS
            </h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FiAward, title: 'State-of-the-art Machines', desc: 'Premium luxury biometrics from international brands ensuring zero-joint strain and maximum hypertrophy.' },
              { icon: FiShield, title: 'Elite Training Staff', desc: 'Certified trainers dedicated to tailoring workouts, diet blueprints, and posture checks for members.' },
              { icon: FiHeart, title: 'Uncompromising Cleanliness', desc: 'Sanitized racks, dry lockers, fresh water dispensers, and continuous air circulation controls.' }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-panel p-8 rounded-2xl glass-panel-hover flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-2xl mb-6">
                    <Icon />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-3">{pillar.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MEMBERSHIP PLANS */}
      <section id="plans" className="py-24 bg-gym-dark relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Membership Plans</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-2">
              FLEXIBLE MEMBERSHIP SCHEMES
            </h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {gymPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between relative group hover:border-gold-500/30 transition-colors duration-300"
              >
                {/* Popular Badge for Yearly */}
                {plan.durationMonths === 12 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-500 text-black text-[10px] font-black uppercase tracking-widest shadow-md">
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
                  onClick={() => handleJoinClick(plan)}
                  className={`w-full py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    plan.durationMonths === 12
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-gold-500/30'
                  }`}
                >
                  Select Plan
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* 7. GALLERY PREVIEW */}
      <section id="gallery" className="py-24 bg-gym-gray relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Visual Tour</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-2">
              SUNRISE GALLERY LOGS
            </h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galImgs.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl overflow-hidden border border-white/5 relative group cursor-pointer"
                onClick={() => navigate('/gallery')}
              >
                <img src={img.imageUrl} alt={img.caption || 'Gym Showcase'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
                  <span className="self-start px-2 py-0.5 rounded bg-gold-500 text-black text-[9px] uppercase tracking-wider font-extrabold mb-1">
                    {img.category}
                  </span>
                  <p className="text-[11px] font-semibold text-white uppercase leading-normal tracking-wide truncate">
                    {img.caption || 'Sunrise Showcase'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-24 bg-gym-dark relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Client Stories</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-2">
              CLIENT TRANSFORMATIONS
            </h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-2xl border border-white/5 relative">
                <FiTrendingUp className="text-gold-500 text-3xl absolute top-8 right-8 opacity-25" />
                <span className="inline-block px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-bold uppercase tracking-wider mb-4">
                  {test.change}
                </span>
                <p className="text-sm text-gray-300 italic font-light leading-relaxed mb-6">
                  "{test.quote}"
                </p>
                <div>
                  <h4 className="text-base font-bold text-white uppercase font-display">{test.name}</h4>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 block">{test.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION */}
      <section id="contact" className="py-24 bg-gym-gray relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Contact Details</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-2 mb-8">
              GET IN TOUCH WITH US
            </h2>
            
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-lg flex-shrink-0">
                  <FiMapPin />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Gym Address</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{contacts.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-lg flex-shrink-0">
                  <FiPhone />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Call or WhatsApp</h4>
                  <p className="text-xs text-gray-400 mt-1">{contacts.phone} / {contacts.whatsapp}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-lg flex-shrink-0">
                  <FiMail />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Support Email</h4>
                  <p className="text-xs text-gray-400 mt-1">{contacts.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-lg flex-shrink-0">
                  <FiClock />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Work Schedule</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{contacts.openingHours}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-8 rounded-2xl border border-white/5"
          >
            <h3 className="text-xl font-bold uppercase text-white mb-6 font-display">Send a message</h3>
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">Phone (Optional)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your query here..."
                  className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white tracking-wider uppercase transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-gym-dark border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display font-black text-sm tracking-wider text-white">
              SUNRISE <span className="text-gold-500">FITNESS</span>
            </span>
            <p className="text-[10px] text-gray-500 mt-1">
              © {new Date().getFullYear()} Sunrise Fitness Hub. All Rights Reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-gold-500 transition-colors">
              <FiInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-gold-500 transition-colors">
              <FiFacebook />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-gold-500 transition-colors">
              <FiYoutube />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
