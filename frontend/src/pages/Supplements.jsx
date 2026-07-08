import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiSearch, FiShoppingBag, FiInfo, FiX, FiCheck } from 'react-icons/fi';

export default function Supplements() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Checkout Modal State
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const categories = ['All', 'Protein', 'Creatine', 'Pre Workout', 'Mass Gainer', 'BCAA', 'Shakers', 'Accessories'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== 'All' ? `&category=${selectedCategory}` : '';
      const searchParam = search ? `&search=${search}` : '';
      const res = await api.get(`/supplements?${categoryParam}${searchParam}`);
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

  const handleBuyClick = (product) => {
    if (product.stock <= 0) {
      addToast('Product is currently out of stock', 'error');
      return;
    }
    setCheckoutProduct(product);
  };

  // Generate UPI payment string for supplement checkout
  const getCheckoutUpiString = () => {
    if (!checkoutProduct) return '';
    const pa = '9299999288@ybl';
    const pn = encodeURIComponent('Sunrise Fitness Hub');
    const am = checkoutProduct.price;
    const tn = encodeURIComponent(`Supplement Purchase - ${checkoutProduct.name}`);
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=INR`;
  };

  const checkoutQrUrl = checkoutProduct
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getCheckoutUpiString())}`
    : '';

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">Inventory Store</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Supplements Store</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
            Genuine brand proteins, pre-workouts, creatines, and workout gear.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <FiSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplements..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
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

      {/* Product Grid */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-gold-500/20 transition-all duration-300"
            >
              <div>
                <div className="aspect-square rounded-xl bg-gym-gray overflow-hidden mb-4 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="px-3 py-1 rounded bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] uppercase font-bold text-gold-500 tracking-wider">
                  {product.category}
                </span>
                <h3 className="text-sm font-bold text-white uppercase truncate mt-1 font-display">
                  {product.name}
                </h3>
                <p className="text-[10px] text-gray-400 leading-relaxed font-light mt-1 mb-3 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-base font-black text-white font-display">₹{product.price}</span>
                <button
                  onClick={() => handleBuyClick(product)}
                  disabled={product.stock <= 0}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-black text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center py-12">
          <FiInfo className="text-gray-500 text-3xl mb-2" />
          <p className="text-sm text-gray-400 font-light">No supplements match your criteria.</p>
        </div>
      )}

      {/* Checkout UPI modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-white/10 relative text-center">
            <button
              onClick={() => setCheckoutProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-base font-bold text-white uppercase tracking-widest mb-4">
              Complete Supplement Purchase
            </h3>

            <div className="aspect-square w-24 mx-auto rounded-xl overflow-hidden mb-3 bg-gym-gray">
              <img src={checkoutProduct.image} alt={checkoutProduct.name} className="w-full h-full object-cover" />
            </div>

            <h4 className="text-sm font-bold text-white truncate">{checkoutProduct.name}</h4>
            <p className="text-xs text-gold-500 font-black mt-1">Amount: ₹{checkoutProduct.price}</p>

            <div className="p-3 bg-white rounded-xl inline-block mt-4 border-2 border-gold-500/20">
              <img src={checkoutQrUrl} alt="Supplement QR" className="w-40 h-40" />
            </div>

            <p className="text-[10px] text-gray-400 leading-normal mt-3 px-4 font-light">
              Scan QR above using any UPI App (GPay/PhonePe/Paytm) to complete payment. Collect product from the Gym desk by presenting the transaction receipt.
            </p>

            <button
              onClick={() => {
                addToast('Payment QR scanned. Present transaction confirmation to desk administrator.', 'success');
                setCheckoutProduct(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gold-500 text-black text-xs font-bold uppercase mt-5"
            >
              Done / Paid
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
