import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiAlertTriangle, FiRotateCcw, FiRefreshCw, FiX } from 'react-icons/fi';

export default function ResetRevenueModal({
  isOpen,
  onClose,
  currentRevenue = 0,
  revenueResetDate = null,
  onSuccess
}) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await api.post('/reports/reset-revenue');
      if (res.data.success) {
        addToast(res.data.message || 'Total revenue counter reset to ₹0', 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Reset revenue error:', err);
      addToast(err.response?.data?.message || 'Failed to reset total revenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const res = await api.post('/reports/restore-revenue');
      if (res.data.success) {
        addToast(res.data.message || 'All-time revenue restored successfully', 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Restore revenue error:', err);
      addToast(err.response?.data?.message || 'Failed to restore all-time revenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formattedResetDate = revenueResetDate
    ? new Date(revenueResetDate).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
            <FiRotateCcw size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Revenue Auditing</span>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
              Reset Total Revenue
            </h3>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Currently Tracked Revenue:</span>
            <span className="text-lg font-black text-gold-500 font-display">
              ₹{Number(currentRevenue).toLocaleString('en-IN')}
            </span>
          </div>

          {formattedResetDate && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Last Reset Date:</span>
              <span className="text-red-400 font-semibold">{formattedResetDate}</span>
            </div>
          )}
        </div>

        {/* Warning text */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-6 text-xs text-gray-300 leading-relaxed flex items-start gap-3">
          <FiAlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-semibold text-white mb-1">
              Are you sure you want to reset the revenue counter to ₹0?
            </p>
            <p className="text-gray-400 text-[11px]">
              This restarts the total revenue counter for a new financial period. All member subscription history, payment proofs, and receipts will remain safely saved in the system.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiRotateCcw size={14} />
                  Confirm Reset (₹0)
                </>
              )}
            </button>
          </div>

          {/* Optional: Restore full historical revenue if currently reset */}
          {revenueResetDate && (
            <div className="pt-3 border-t border-white/5 flex justify-center">
              <button
                type="button"
                onClick={handleRestore}
                disabled={loading}
                className="text-[11px] text-gold-500 hover:text-gold-400 flex items-center gap-1.5 font-bold uppercase tracking-wider hover:underline cursor-pointer disabled:opacity-50"
              >
                <FiRefreshCw size={12} />
                Restore All-Time Historical Revenue
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
