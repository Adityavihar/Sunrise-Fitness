import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiChevronDown, FiActivity, FiAward, FiShield, FiTrendingUp
} from 'react-icons/fi';

const TOTAL_FRAMES = 212;

// Generate image path for a given 0-indexed frame
const getFrameUrl = (index) => {
  const frameNumber = String(index + 1).padStart(3, '0');
  const base = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
  return `${base}/hero-frames/ezgif-frame-${frameNumber}.jpg`;
};

export default function HeroScrollSection({ user, onJoinClick }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Track frames and loaded states
  const imagesRef = useRef(new Array(TOTAL_FRAMES).fill(null));
  const loadedFramesRef = useRef(new Set());
  const currentFrameRef = useRef(0);
  const animationFrameRef = useRef(null);

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Render a specific frame onto the canvas using 'cover' aspect ratio fit
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pick target image or closest available loaded frame
    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      img = findNearestLoadedFrame(frameIndex);
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;
    const offsetX = (canvasWidth - renderWidth) / 2;
    const offsetY = (canvasHeight - renderHeight) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  }, []);

  // Search outward for the nearest loaded frame to prevent blank flashes
  const findNearestLoadedFrame = (targetIndex) => {
    for (let offset = 0; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && imagesRef.current[prev]?.complete && imagesRef.current[prev].naturalWidth > 0) {
        return imagesRef.current[prev];
      }
      const next = targetIndex + offset;
      if (next < TOTAL_FRAMES && imagesRef.current[next]?.complete && imagesRef.current[next].naturalWidth > 0) {
        return imagesRef.current[next];
      }
    }
    return null;
  };

  // Adjust canvas buffer resolution to viewport & device pixel ratio
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // Preloading frames: Prioritize Frame 0, then keyframes, then all in background
  useEffect(() => {
    let isMounted = true;

    // 1. Load Frame 0 immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = () => {
      if (!isMounted) return;
      imagesRef.current[0] = firstImg;
      loadedFramesRef.current.add(0);
      setInitialLoaded(true);
      setLoadedCount(1);
      updateCanvasDimensions();
    };

    // 2. Preload remaining frames with keyframe prioritization
    const preloadRest = () => {
      // Step A: Preload every 6th frame first for rapid scrub previews
      const keyframeIndices = [];
      for (let i = 6; i < TOTAL_FRAMES; i += 6) {
        keyframeIndices.push(i);
      }

      // Step B: Collect all other intermediate frames
      const remainingIndices = [];
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (i % 6 !== 0) remainingIndices.push(i);
      }

      const queue = [...keyframeIndices, ...remainingIndices];
      let activeRequests = 0;
      const MAX_CONCURRENT = 8;

      const loadNext = () => {
        if (!isMounted || queue.length === 0) return;
        while (activeRequests < MAX_CONCURRENT && queue.length > 0) {
          const idx = queue.shift();
          activeRequests++;

          const img = new Image();
          img.src = getFrameUrl(idx);
          img.onload = () => {
            if (isMounted) {
              imagesRef.current[idx] = img;
              loadedFramesRef.current.add(idx);
              setLoadedCount(loadedFramesRef.current.size);
              // If this is the active frame being viewed, re-draw it sharp
              if (currentFrameRef.current === idx) {
                renderFrame(idx);
              }
            }
            activeRequests--;
            loadNext();
          };
          img.onerror = () => {
            activeRequests--;
            loadNext();
          };
        }
      };

      loadNext();
    };

    // Give priority to initial paint before kicking off background loading
    const timer = setTimeout(preloadRest, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [updateCanvasDimensions, renderFrame]);

  // Scroll handler tied to container offset
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const rawProgress = scrolled / totalScrollable;
      const clampedProgress = Math.min(1, Math.max(0, rawProgress));

      setScrollProgress(clampedProgress);

      const targetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(clampedProgress * (TOTAL_FRAMES - 1)))
      );

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(() => {
            renderFrame(targetFrame);
            animationFrameRef.current = null;
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateCanvasDimensions);
    updateCanvasDimensions();
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateCanvasDimensions);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderFrame, updateCanvasDimensions]);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper for text stage opacities and transforms
  // Stage 1: 0% to 32%
  const stage1Opacity = Math.max(0, Math.min(1, (0.30 - scrollProgress) / 0.15));
  const stage1Y = -scrollProgress * 80;

  // Stage 2: 32% to 68%
  let stage2Opacity = 0;
  if (scrollProgress >= 0.28 && scrollProgress <= 0.70) {
    if (scrollProgress < 0.40) {
      stage2Opacity = (scrollProgress - 0.28) / 0.12; // fade in
    } else if (scrollProgress > 0.58) {
      stage2Opacity = (0.70 - scrollProgress) / 0.12; // fade out
    } else {
      stage2Opacity = 1;
    }
  }
  const stage2Y = (0.50 - scrollProgress) * 50;

  // Stage 3: 68% to 100%
  const stage3Opacity = Math.max(0, Math.min(1, (scrollProgress - 0.68) / 0.15));
  const stage3Y = (0.85 - Math.min(1, scrollProgress)) * 50;

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative h-[280vh] sm:h-[320vh] bg-black"
    >
      {/* Sticky Viewport (100vh pinned) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Hardware-accelerated canvas for 60/120fps video frames */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Cinematic Lighting Vignette & Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-gym-dark via-gym-dark/50 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-gym-dark pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70 pointer-events-none" />

        {/* Loading shimmer fallback before Frame 0 mounts */}
        {!initialLoaded && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 border-3 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4" />
            <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">
              Entering Sunrise Arena...
            </span>
          </div>
        )}

        {/* STAGE 1: HERO ENTRANCE (0% - 32% Scroll) */}
        <div
          style={{
            opacity: stage1Opacity,
            transform: `translate3d(0, ${stage1Y}px, 0)`,
            pointerEvents: stage1Opacity > 0.1 ? 'auto' : 'none',
            display: stage1Opacity <= 0 ? 'none' : 'block'
          }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10 transition-opacity duration-150"
        >
          <div className="max-w-5xl mx-auto pt-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              Build Your Ultimate Physique
            </span>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tight leading-none mb-6 drop-shadow-2xl font-display">
              SUNRISE <span className="gold-text-gradient">FITNESS</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-10 drop-shadow-md">
              The premier fitness and strength training environment in Annavaram. Step into luxury space, expert coaching, and results-driven community.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => scrollToSection('plans')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold tracking-wide shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Join Today
                <FiArrowRight />
              </button>

              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 font-bold transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 font-bold transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                >
                  Member Login
                </Link>
              )}
            </div>

            {/* Animated Statistics */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-14 pt-8 border-t border-white/10">
              {[
                { num: '100+', label: 'Active Members' },
                { num: '50+', label: 'Imported Machines' },
                { num: '5.0★', label: 'Client Reviews' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-gold-500 font-display drop-shadow">
                    {stat.num}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-gray-300 mt-1 uppercase tracking-widest font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Guidance Indicator */}
          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer"
            onClick={() => scrollToSection('about')}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500/80">
              Scroll To Tour Gym
            </span>
            <div className="w-8 h-8 rounded-full border border-gold-500/30 bg-black/40 backdrop-blur-sm flex items-center justify-center text-gold-500">
              <FiChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* STAGE 2: MID-ARENA WALKTHROUGH (32% - 68% Scroll) */}
        <div
          style={{
            opacity: stage2Opacity,
            transform: `translate3d(0, ${stage2Y}px, 0)`,
            pointerEvents: stage2Opacity > 0.2 ? 'auto' : 'none',
            display: stage2Opacity <= 0 ? 'none' : 'block'
          }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10 transition-opacity duration-150"
        >
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
              State-of-the-Art Biomechanics
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-tight mb-6 drop-shadow-2xl font-display">
              ENGINEERED FOR <span className="gold-text-gradient">PERFORMANCE</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-8 drop-shadow">
              Step through our international resistance floors, selectorized pin lines, and commercial dumbbell tiers engineered for relentless hypertrophy and power.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
              <span className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-2">
                <FiActivity className="text-gold-500" /> Matrix Strength Series
              </span>
              <span className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-2">
                <FiAward className="text-gold-500" /> Calibrated Olympic Bars
              </span>
              <span className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-2">
                <FiShield className="text-gold-500" /> Climate-Controlled Space
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 3: HEAVY IRON & CALL TO ACTION (68% - 100% Scroll) */}
        <div
          style={{
            opacity: stage3Opacity,
            transform: `translate3d(0, ${stage3Y}px, 0)`,
            pointerEvents: stage3Opacity > 0.2 ? 'auto' : 'none',
            display: stage3Opacity <= 0 ? 'none' : 'block'
          }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10 transition-opacity duration-150"
        >
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
              Unleash Your Full Potential
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-tight mb-6 drop-shadow-2xl font-display">
              CLAIM YOUR <span className="gold-text-gradient">DOMAIN</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-8 drop-shadow">
              Squat racks, deadlift platforms, and elite personal coaches ready to transform your ambition into undeniable results.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => scrollToSection('plans')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-gold-500 to-yellow-600 hover:from-gold-400 hover:to-gold-500 text-black font-extrabold tracking-wide shadow-xl shadow-gold-500/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Explore Membership Tiers
                <FiArrowRight />
              </button>

              <button
                onClick={() => scrollToSection('about')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold transition-all duration-300 flex items-center justify-center backdrop-blur-sm cursor-pointer"
              >
                Learn About Gym ↓
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Progress Bar at bottom of pinned viewport */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-gold-500 to-yellow-400 transition-all duration-75"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        {/* Subtle Frame Scrub Counter (Bottom Right) */}
        <div className="absolute bottom-3 right-4 z-20 hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] text-gray-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Tour {Math.min(TOTAL_FRAMES, currentFrameRef.current + 1)}/{TOTAL_FRAMES}</span>
        </div>

      </div>
    </section>
  );
}
