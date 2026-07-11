import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageCompressor';
import { FiPlus, FiTrash2, FiX, FiCamera, FiUpload, FiInfo } from 'react-icons/fi';

export default function AdminGallery() {
  const { addToast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [category, setCategory] = useState('Gym');
  const [caption, setCaption] = useState('');
  const [fileObject, setFileObject] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery');
      if (res.data.success) {
        setImages(res.data.images);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileObject(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileObject) {
      addToast('Please select an image file to upload', 'error');
      return;
    }

    setUploading(true);
    let finalFile = fileObject;
    if (fileObject.size > 150 * 1024) { // Compress images above 150KB to optimize bandwidth
      try {
        finalFile = await compressImage(fileObject, 1200, 1200, 0.85);
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('caption', caption);
    formData.append('image', finalFile);

    try {
      const res = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setCaption('');
        setFileObject(null);
        setImgPreview('');
        fetchImages();
      }
    } catch (err) {
      addToast('Error uploading gallery image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery image?')) return;
    try {
      const res = await api.delete(`/gallery/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchImages();
      }
    } catch (err) {
      addToast('Failed to delete image.', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Upload card (1 col) */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 h-fit text-left">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
          Upload Showcase Image
        </h3>

        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5">
          {/* File input */}
          <div className="relative border border-dashed border-white/10 hover:border-red-500/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gym-dark/30 hover:bg-gym-dark/60 transition-colors">
            {imgPreview ? (
              <img src={imgPreview} alt="Preview" className="max-h-32 object-contain rounded" />
            ) : (
              <>
                <FiUpload className="text-gray-500 text-2xl mb-2" />
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Choose image file</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none cursor-pointer"
            >
              <option value="Gym" className="bg-gym-card">Gym Interior</option>
              <option value="Machines" className="bg-gym-card">Machines</option>
              <option value="Workout Area" className="bg-gym-card">Workout Area</option>
              <option value="Transformations" className="bg-gym-card">Transformations</option>
              <option value="Events" className="bg-gym-card">Events</option>
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter brief description"
              className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase transition-colors shadow-lg shadow-red-600/25 disabled:opacity-50 mt-2"
          >
            {uploading ? 'Uploading Asset...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Gallery list grid (2 cols) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-bold">Admin Hub</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Gallery Catalog</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
            Manage media files visible in the landing page slideshows and masonry gallery grids.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img._id}
                className="aspect-square rounded-2xl overflow-hidden border border-white/5 relative group"
              >
                <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                  <span className="self-start px-2 py-0.5 rounded bg-red-600 text-white text-[8px] uppercase tracking-wider font-bold">
                    {img.category}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="self-end p-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 hover:border-red-500 transition-all cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center py-12">
            <FiInfo className="text-gray-500 text-3xl mb-2" />
            <p className="text-sm text-gray-400 font-light">No images currently in gallery catalog.</p>
          </div>
        )}
      </div>

    </div>
  );
}
