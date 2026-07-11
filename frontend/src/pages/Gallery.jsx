import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiX, FiInfo, FiMaximize2 } from 'react-icons/fi';

export default function Gallery() {
  const { addToast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Lightbox State
  const [activeImage, setActiveImage] = useState(null);

  const categories = ['All', 'Gym', 'Machines', 'Workout Area', 'Transformations', 'Events'];

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== 'All' ? `?category=${selectedCategory}` : '';
      const res = await api.get(`/gallery${categoryParam}`);
      if (res.data.success) {
        setImages(res.data.images);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load gallery logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const defaultImages = [
    { _id: '1', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60', category: 'Gym', caption: 'Sunrise premium dumbbell deck' },
    { _id: '2', imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=60', category: 'Machines', caption: 'High-end bio-mechanical chest press' },
    { _id: '3', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60', category: 'Workout Area', caption: 'Spacious strength floor' },
    { _id: '4', imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60', category: 'Transformations', caption: 'Body transformations showcase area' },
    { _id: '5', imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&auto=format&fit=crop&q=60', category: 'Events', caption: 'Powerlifting league meets' }
  ];

  const galleryList = images.length > 0 ? images : defaultImages;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">Showcase</span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Gym Gallery</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
          Take a look at our workspace, machinery, powerlifting meets, and transformations.
        </p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors duration-300 ${
              selectedCategory === cat
                ? 'bg-gold-500 text-black'
                : 'bg-gym-gray text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid image list */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : galleryList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...galleryList]
            .sort((a, b) => {
              const priority = { 'Gym': 1, 'Machines': 2, 'Workout Area': 3, 'Transformations': 4, 'Events': 5 };
              const priorityA = priority[a.category] || 99;
              const priorityB = priority[b.category] || 99;
              if (priorityA !== priorityB) return priorityA - priorityB;
              return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            })
            .map((img) => (
              <div
                key={img._id}
                onClick={() => setActiveImage(img)}
                className="aspect-square rounded-2xl overflow-hidden border border-white/5 relative group cursor-pointer shadow-lg hover:border-gold-500/20 transition-all duration-300"
              >
                <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left">
                  <span className="self-start px-2 py-0.5 rounded bg-gold-500 text-black text-[9px] uppercase tracking-wider font-extrabold mb-1">
                    {img.category}
                  </span>
                  <h4 className="text-xs font-semibold text-white uppercase truncate">{img.caption || 'Sunrise Showcase'}</h4>
                  <FiMaximize2 className="text-white text-base absolute top-5 right-5" />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center py-12">
          <FiInfo className="text-gray-500 text-3xl mb-2" />
          <p className="text-sm text-gray-400 font-light">No images found in this gallery category.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setActiveImage(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-0 right-0 -mt-10 text-gray-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
            >
              <FiX size={20} />
              Close
            </button>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-gym-gray">
              <img src={activeImage.imageUrl} alt={activeImage.caption} className="max-w-full max-h-[75vh] object-contain" />
            </div>
            <div className="text-center mt-4 px-6 max-w-xl">
              <span className="text-[10px] uppercase font-black text-gold-500 tracking-wider">
                {activeImage.category}
              </span>
              <p className="text-sm text-white font-medium mt-1 leading-normal">
                {activeImage.caption || 'Sunrise Fitness Hub Showcase'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
