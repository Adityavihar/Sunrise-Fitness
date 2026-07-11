import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageCompressor';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiInfo, FiUpload, FiCamera, FiSearch } from 'react-icons/fi';

export default function AdminSupplements() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Protein',
    description: '',
    price: '',
    stock: ''
  });
  const [fileObject, setFileObject] = useState(null);
  const [imgPreview, setImgPreview] = useState('');

  const categories = ['Protein', 'Creatine', 'Pre Workout', 'Mass Gainer', 'BCAA', 'Shakers', 'Accessories'];

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const catParam = categoryFilter !== 'All' ? `&category=${categoryFilter}` : '';
      const searchParam = search ? `&search=${search}` : '';
      const res = await api.get(`/supplements?isAdminView=true${catParam}${searchParam}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load supplements directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Protein', description: '', price: '', stock: '' });
    setFileObject(null);
    setImgPreview('');
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      stock: prod.stock
    });
    setFileObject(null);
    setImgPreview(prod.image);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplement product "${name}"?`)) return;
    try {
      const res = await api.delete(`/supplements/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchProducts();
      }
    } catch (err) {
      addToast('Failed to delete supplement record.', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileObject(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      addToast('Complete all fields', 'error');
      return;
    }

    let finalFile = fileObject;
    if (fileObject && fileObject.size > 150 * 1024) {
      try {
        finalFile = await compressImage(fileObject, 1200, 1200, 0.85);
      } catch (err) {
        console.error('Supplement product image compression failed:', err);
      }
    }

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('stock', formData.stock);

    if (finalFile) {
      payload.append('image', finalFile);
    }

    try {
      if (editingProduct) {
        const res = await api.put(`/supplements/${editingProduct._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          addToast(res.data.message, 'success');
          setShowModal(false);
          fetchProducts();
        }
      } else {
        if (!fileObject) {
          addToast('Product image is required', 'error');
          return;
        }
        const res = await api.post('/supplements', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          addToast(res.data.message, 'success');
          setShowModal(false);
          fetchProducts();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing supplements transactions', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-bold">Admin Hub</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Supplement Inventory</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
            Manage supplements stock indices, categorize, change pictures, and adjust prices.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/25"
        >
          <FiPlus />
          Add Product
        </button>
      </div>

      {/* Filters panel */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <FiSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplements catalog..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Category select */}
        <div className="relative w-full sm:w-48 flex items-center bg-gym-gray/60 border border-white/10 rounded-xl px-3 text-xs text-white">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent py-2.5 outline-none cursor-pointer border-none"
          >
            <option value="All" className="bg-gym-card text-white">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c} className="bg-gym-card text-white">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory list table */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-white/5 bg-gym-gray/40 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {/* Photo & details */}
                  <td className="py-3 px-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gym-gray border border-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase truncate max-w-[200px]">{prod.name}</h4>
                      <span className="text-[10px] text-gray-500 line-clamp-1 max-w-[250px]">{prod.description}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-6 text-gray-300 font-medium">{prod.category}</td>

                  {/* Price */}
                  <td className="py-3 px-6 text-white font-bold">₹{prod.price}</td>

                  {/* Stock */}
                  <td className="py-3 px-6">
                    <span className={`font-semibold ${prod.stock <= 0 ? 'text-red-500' : 'text-gray-300'}`}>
                      {prod.stock} units
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-6 text-right flex items-center justify-end gap-2 h-full">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(prod._id, prod.name)}
                      className="p-2 rounded bg-white/5 hover:bg-white/10 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center py-12">
          <FiInfo className="text-gray-500 text-3xl mb-2" />
          <p className="text-sm text-gray-400 font-light">No products defined in store inventory.</p>
        </div>
      )}

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-2xl border border-white/10 relative flex flex-col gap-4 text-left"
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">
              {editingProduct ? 'Edit product inventory details' : 'Add new product to store'}
            </h3>

            {/* Photo preview */}
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="relative w-20 h-20 rounded-xl border border-dashed border-white/10 bg-gym-dark overflow-hidden flex items-center justify-center cursor-pointer group">
                {imgPreview ? (
                  <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiCamera className="text-xl text-gray-500 group-hover:text-red-500 transition-colors" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Select photo</span>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Price (INR) *</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Stock count *</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-gym-card text-white">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Description *</label>
              <textarea
                required
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase transition-colors shadow-lg mt-2"
            >
              {editingProduct ? 'Save Configurations' : 'Complete Registration'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
