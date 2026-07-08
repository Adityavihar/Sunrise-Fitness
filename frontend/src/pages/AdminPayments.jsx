import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiCheck, FiX, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export default function AdminPayments() {
  const { addToast } = useToast();

  // Core States
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending

  // Verify Modal State
  const [activePayment, setActivePayment] = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payments?status=${statusFilter}`);
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve payments history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVerify = (payment) => {
    setActivePayment(payment);
    setRejectMode(false);
    setRejectionReason('');
  };

  const handleProcessVerification = async (status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      addToast('Please enter a rejection reason', 'error');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.put(`/payments/${activePayment._id}/verify`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setActivePayment(null);
        fetchPayments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing verification', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-bold">Admin Hub</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Payment Verification</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
            Review submitted fee transaction references, screenshots, and issue receipts.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gym-gray p-1 rounded-xl border border-white/5">
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                statusFilter === s
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : payments.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-white/5 bg-gym-gray/40 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="py-4 px-6">Member details</th>
                <th className="py-4 px-6">Select Subscription</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Transaction Ref</th>
                <th className="py-4 px-6">Date Uploaded</th>
                <th className="py-4 px-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {/* Photo & Name */}
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {pay.user?.profilePicture ? (
                        <img src={pay.user.profilePicture} alt={pay.user?.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gold-500">{pay.user?.name ? pay.user.name[0].toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase">{pay.user?.name || 'Deleted User'}</h4>
                      <span className="text-[10px] text-gray-500">{pay.user?.phone}</span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-4 px-6 font-medium text-white uppercase">{pay.plan?.name}</td>

                  {/* Amount */}
                  <td className="py-4 px-6 text-gold-500 font-bold font-display">₹{pay.amount}</td>

                  {/* Ref */}
                  <td className="py-4 px-6 font-medium text-gray-400 truncate max-w-[120px]" title={pay.upiTransactionId}>
                    {pay.upiTransactionId || 'N/A'}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 font-medium text-gray-400">
                    {new Date(pay.createdAt).toLocaleDateString()}
                  </td>

                  {/* Verification action */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenVerify(pay)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                        statusFilter === 'pending'
                          ? 'bg-red-600 border-red-500 text-white hover:bg-red-500'
                          : 'bg-white/5 border-white/5 hover:border-gold-500/20 text-gold-500'
                      }`}
                    >
                      {statusFilter === 'pending' ? 'Verify Reciept' : 'Inspect logs'}
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
          <p className="text-sm text-gray-400 font-light">
            No payments currently match status '{statusFilter}'.
          </p>
        </div>
      )}

      {/* Inspect / Verification Modal */}
      {activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-2xl border border-white/10 relative flex flex-col gap-5 text-left">
            <button
              onClick={() => setActivePayment(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest">
              Inspect Payment Reference
            </h3>

            {/* Receipt Image Inspect */}
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-white/10 bg-gym-dark shadow relative">
              <img src={activePayment.screenshot} alt="Receipt Screenshot" className="w-full h-full object-contain" />
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gym-gray/60 border border-white/5 p-4 rounded-xl">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Sender</span>
                <p className="font-semibold text-white mt-0.5">{activePayment.user?.name || 'Deleted User'}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Transaction Ref</span>
                <p className="font-semibold text-white mt-0.5">{activePayment.upiTransactionId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Subscription Plan</span>
                <p className="font-semibold text-white mt-0.5">{activePayment.plan?.name} (₹{activePayment.amount})</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Date</span>
                <p className="font-semibold text-white mt-0.5">{new Date(activePayment.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Verify Actions */}
            {statusFilter === 'pending' && (
              <div className="flex flex-col gap-3">
                {!rejectMode ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleProcessVerification('approved')}
                      disabled={verifying}
                      className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FiCheck />
                      Approve Receipt
                    </button>
                    <button
                      onClick={() => setRejectMode(true)}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:border-red-500 text-red-500 text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FiX />
                      Reject Payment
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <textarea
                      rows={2}
                      required
                      placeholder="Write rejection feedback reason here..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleProcessVerification('rejected')}
                        disabled={verifying}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase transition-colors cursor-pointer"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setRejectMode(false)}
                        className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
