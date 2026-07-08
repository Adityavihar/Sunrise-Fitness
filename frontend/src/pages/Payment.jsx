import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiCheckCircle, FiInfo, FiUpload, FiDownload, FiClock, FiAlertTriangle } from 'react-icons/fi';

export default function Payment() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Selected Plan from redirection state
  const redirectedPlan = location.state?.selectedPlan || null;

  // States
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(redirectedPlan);
  const [upiId, setUpiId] = useState('9299999288@ybl'); // Sunrise Gym UPI
  const [contacts, setContacts] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const [pastPayments, setPastPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlansAndHistory();
  }, []);

  const fetchPlansAndHistory = async () => {
    setLoading(true);
    try {
      const [plansRes, paymentsRes, contactRes] = await Promise.all([
        api.get('/plans'),
        api.get('/payments/my-payments'),
        api.get('/contact')
      ]);

      if (plansRes.data.success) {
        setPlans(plansRes.data.plans);
        // If not redirected, default to first active plan
        if (!selectedPlan && plansRes.data.plans.length > 0) {
          setSelectedPlan(plansRes.data.plans[0]);
        }
      }
      if (paymentsRes.data.success) {
        setPastPayments(paymentsRes.data.payments);
      }
      if (contactRes.data.success) {
        setContacts(contactRes.data.config);
        if (contactRes.data.config.phone) {
          setUpiId(contactRes.data.config.phone + '@ybl');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load payment resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (e) => {
    const plan = plans.find(p => p._id === e.target.value);
    setSelectedPlan(plan);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File must be under 5MB', 'error');
        return;
      }
      setScreenshot(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      addToast('Please choose a plan', 'error');
      return;
    }
    if (!screenshot) {
      addToast('Please attach the transaction screenshot', 'error');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('planId', selectedPlan._id);
    formData.append('upiTransactionId', transactionId);
    formData.append('screenshot', screenshot);

    try {
      const res = await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setTransactionId('');
        setScreenshot(null);
        setImgPreview('');
        fetchPlansAndHistory();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting payment details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate dynamic UPI Deep Linking String for QR Generator
  const generateUpiString = () => {
    if (!selectedPlan) return '';
    const name = encodeURIComponent('Sunrise Fitness Hub');
    const amount = selectedPlan.price;
    return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
  };

  // Helper to dynamically resolve local image host in case of port/IP mismatch
  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const backendBase = API_URL.replace('/api', '');
      if (url.includes('/uploads/')) {
        const pathPart = url.substring(url.indexOf('/uploads/'));
        return `${backendBase}${pathPart}`;
      }
    }
    return url;
  };

  const qrImageSrc = (contacts && contacts.qrCode)
    ? `${resolveImageUrl(contacts.qrCode)}?v=${contacts.updatedAt ? new Date(contacts.updatedAt).getTime() : Date.now()}`
    : (selectedPlan
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateUpiString())}`
      : '');

  // Clean iframe receipt printer
  const printReceipt = (payment) => {
    const printWindow = window.open('', '_blank');
    const invoiceHtml = `
      <html>
        <head>
          <title>Payment Receipt - Sunrise Fitness Hub</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; padding: 40px; margin: 0; line-height: 1.6; }
            .receipt-box { max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 1px; }
            .logo span { color: #d4af37; }
            .subtitle { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 2px; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; font-size: 13px; margin-bottom: 30px; }
            .details-grid div span { display: block; font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { border-bottom: 2px solid #eee; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #888; }
            .table td { border-bottom: 1px solid #eee; padding: 12px 10px; font-size: 13px; }
            .total-row { font-size: 18px; font-weight: bold; text-align: right; }
            .footer-notes { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="logo">SUNRISE <span>FITNESS</span></div>
              <div class="subtitle">Official Payment Receipt</div>
              <p style="font-size: 11px; margin: 5px 0 0 0; color: #555;">
                Kapilivaivari Street, infront of Seshadri Sadan, Annavarm, 533406<br>Mobile: 9299999288
              </p>
            </div>
            
            <div class="details-grid">
              <div>
                <span>Receipt Number</span>
                <strong>${payment.receiptNumber || 'N/A'}</strong>
              </div>
              <div>
                <span>Date Issued</span>
                <strong>${new Date(payment.updatedAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span>Billed To</span>
                <strong>${user.name}</strong>
              </div>
              <div>
                <span>Mobile Number</span>
                <strong>${user.phone}</strong>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Gym Membership: ${payment.plan?.name} Plan</strong><br>
                    <span style="font-size: 11px; color: #666;">Duration: ${payment.plan?.durationMonths} Month(s)</span>
                  </td>
                  <td style="text-align: right; font-weight: bold;">₹${payment.amount}</td>
                </tr>
                <tr>
                  <td colspan="2" class="total-row">Total Paid: ₹${payment.amount}</td>
                </tr>
              </tbody>
            </table>

            <div style="font-size: 11px; color: #555; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; margin-bottom: 20px;">
              <strong>Payment Metadata:</strong><br>
              UPI Transaction ID: ${payment.upiTransactionId || 'N/A'}<br>
              Verification Channel: Admin Manual Verification
            </div>

            <div class="footer-notes">
              Thank you for training with Sunrise Fitness Hub!<br>
              For support, reach out to fitness desk or call 9299999288.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Form and Scan QR (2 cols width) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {loading ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white uppercase tracking-widest mb-6">
              Membership Payment Scan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Scan Box */}
              <div className="flex flex-col items-center text-center">
                {selectedPlan ? (
                  <>
                    <div className="p-3 bg-white rounded-xl shadow-lg inline-block border-4 border-gold-500/20">
                      <img src={qrImageSrc} alt="UPI QR" className="w-48 h-48 object-contain" />
                    </div>
                    <span className="text-[9px] text-gray-500 break-all mt-2 max-w-[200px] block">
                      Source: {qrImageSrc || 'None'}
                    </span>
                    <p className="text-xs font-semibold text-white mt-4 uppercase">
                      Scan to pay <span className="text-gold-500">₹{selectedPlan.price}</span>
                    </p>
                    <span className="text-[10px] text-gray-400 font-light mt-1">
                      UPI ID: <span className="font-bold text-gray-300">{upiId}</span>
                    </span>
                  </>
                ) : (
                  <div className="p-8 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500">
                    <FiAlertTriangle className="text-2xl mb-2" />
                    <p className="text-xs">Please select a plan to generate QR</p>
                  </div>
                )}
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSubmitPayment} className="flex flex-col gap-5">
                {/* Dropdown Selection */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                    Select Plan *
                  </label>
                  <select
                    value={selectedPlan?._id || ''}
                    onChange={handlePlanChange}
                    className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none cursor-pointer"
                  >
                    {plans.map(p => (
                      <option key={p._id} value={p._id} className="bg-gym-card">
                        {p.name} - ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction Ref */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                    UPI Transaction ID (Ref No)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter 12-digit transaction ID"
                    className="w-full px-4 py-3 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {/* Screenshot Input */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                    Upload Screenshot *
                  </label>
                  <div className="relative border border-dashed border-white/10 hover:border-gold-500/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gym-dark/30 hover:bg-gym-dark/60 transition-colors">
                    {imgPreview ? (
                      <img src={imgPreview} alt="Screenshot Preview" className="max-h-24 object-contain rounded" />
                    ) : (
                      <>
                        <FiUpload className="text-gray-500 text-lg mb-1" />
                        <span className="text-[10px] text-gray-400">Click to select receipt screenshot</span>
                      </>
                    )}
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white tracking-wider uppercase disabled:opacity-50 cursor-pointer transition-all duration-300"
                >
                  {submitting ? 'Submitting Details...' : 'Submit Payment Verification'}
                </button>
              </form>

            </div>
          </div>
        )}
      </div>

      {/* History Log Column */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-6">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Payment logs</h3>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px] pr-1">
          {pastPayments.length > 0 ? (
            pastPayments.map((payment, idx) => (
              <div
                key={payment._id}
                className="p-4 rounded-xl bg-gym-gray/60 border border-white/5 flex flex-col justify-between gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      {payment.plan?.name} Plan
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-black text-gold-500 font-display">₹{payment.amount}</span>
                </div>

                <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2.5">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${
                    payment.status === 'approved'
                      ? 'text-green-500'
                      : payment.status === 'rejected'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }`}>
                    {payment.status === 'approved' && <FiCheckCircle />}
                    {payment.status === 'pending' && <FiClock />}
                    {payment.status}
                  </span>

                  {payment.status === 'approved' && (
                    <button
                      onClick={() => printReceipt(payment)}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gold-500 hover:text-white transition-colors cursor-pointer bg-white/5 px-2 py-1 rounded"
                    >
                      <FiDownload />
                      Receipt
                    </button>
                  )}
                </div>

                {payment.status === 'rejected' && payment.rejectionReason && (
                  <p className="text-[9px] text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded leading-normal">
                    Rejection Reason: {payment.rejectionReason}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 py-8 text-center">No payment history found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
