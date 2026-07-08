import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiTrendingUp, FiDownload, FiUsers, FiClock, FiActivity, FiInfo } from 'react-icons/fi';

export default function AdminReports() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    pendingPayments: 0,
    todayRegistrations: 0,
    totalRevenue: 0
  });

  const [charts, setCharts] = useState({
    revenueHistory: [],
    planDistribution: [],
    dailyRegistrations: []
  });

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve reports data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Compile print template for PDF download
  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    const reportHtml = `
      <html>
        <head>
          <title>Executive Summary Report - Sunrise Fitness Hub</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; padding: 40px; margin: 0; line-height: 1.6; }
            .report-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 35px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.03); }
            .header { text-align: center; border-bottom: 2px solid #e53e3e; padding-bottom: 20px; margin-bottom: 35px; }
            .logo { font-size: 26px; font-weight: bold; letter-spacing: 1px; }
            .logo span { color: #d4af37; }
            .subtitle { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 3px; font-weight: bold; margin-top: 5px; }
            .metadata { font-size: 11px; color: #888; text-align: right; margin-bottom: 25px; }
            .stats-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-bottom: 35px; }
            .stats-card { background: #fafafa; border: 1px solid #eee; padding: 15px; border-radius: 6px; text-align: center; }
            .stats-card span { display: block; font-size: 9px; text-transform: uppercase; color: #777; font-weight: bold; }
            .stats-card h3 { font-size: 20px; margin: 5px 0 0 0; color: #222; font-weight: bold; }
            .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; color: #e53e3e; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .table th { border-bottom: 2px solid #eee; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #777; }
            .table td { border-bottom: 1px solid #eee; padding: 10px 8px; font-size: 12px; }
            .footer-notes { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 25px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="report-box">
            <div class="header">
              <div class="logo">SUNRISE <span>FITNESS</span></div>
              <div class="subtitle">Gym Executive Summary Report</div>
            </div>

            <div class="metadata">
              Report Generated: ${new Date().toLocaleString()}<br>
              Annavarm Center • Mobile: 9299999288
            </div>

            <div class="stats-grid">
              <div class="stats-card">
                <span>Total Revenue</span>
                <h3>₹${stats.totalRevenue}</h3>
              </div>
              <div class="stats-card">
                <span>Active Members</span>
                <h3>${stats.activeMembers}</h3>
              </div>
              <div class="stats-card">
                <span>Expired Subscriptions</span>
                <h3>${stats.expiredMembers}</h3>
              </div>
              <div class="stats-card">
                <span>Pending Approvals</span>
                <h3>${stats.pendingPayments}</h3>
              </div>
              <div class="stats-card">
                <span>Total Registered</span>
                <h3>${stats.totalMembers}</h3>
              </div>
              <div class="stats-card">
                <span>Today's Registrations</span>
                <h3>${stats.todayRegistrations}</h3>
              </div>
            </div>

            <div class="section-title">Monthly Revenue Logs</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th style="text-align: right;">Revenue (INR)</th>
                </tr>
              </thead>
              <tbody>
                ${charts.revenueHistory.map(row => `
                  <tr>
                    <td><strong>${row.month}</strong></td>
                    <td style="text-align: right; font-weight: bold;">₹${row.revenue}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="section-title">Membership Plan Distributions</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Plan Tier Name</th>
                  <th style="text-align: right;">Active Count</th>
                </tr>
              </thead>
              <tbody>
                ${charts.planDistribution.map(row => `
                  <tr>
                    <td><strong>${row.name}</strong></td>
                    <td style="text-align: right; font-weight: bold;">${row.value} member(s)</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer-notes">
              Sunrise Fitness Hub Proprietary Management Blueprint.<br>
              Confidential report generated for administrator verification.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  const handleExportCsv = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${API_URL}/members/export/csv`, '_blank');
    addToast('CSV audit spreadsheet download started.', 'success');
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-bold">Admin Hub</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Analytical Reports</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
            Generate and print reports detailing membership statuses, revenues, and sales.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCsv}
            className="px-5 py-2.5 rounded-xl border border-gold-500/30 hover:border-gold-500 text-xs font-bold text-gold-500 hover:bg-gold-500/5 transition-all duration-300 uppercase flex items-center gap-2 cursor-pointer"
          >
            <FiDownload />
            Export Audit Spreadsheet
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/25"
          >
            <FiDownload />
            Download PDF Summary
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Revenue Logs table card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-gold-500" />
                Monthly Revenue Audits
              </h3>
              
              <div className="flex flex-col gap-3">
                {charts.revenueHistory.length > 0 ? (
                  charts.revenueHistory.map((row, idx) => (
                    <div key={idx} className="flex justify-between py-3 border-b border-white/5 last:border-0 text-xs font-medium">
                      <span className="text-gray-400">{row.month}</span>
                      <span className="text-white font-bold">₹{row.revenue}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">No monthly records found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Subscriptions Distributions table card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiUsers className="text-gold-500" />
                Membership Plan Distribution
              </h3>

              <div className="flex flex-col gap-3">
                {charts.planDistribution.length > 0 ? (
                  charts.planDistribution.map((row, idx) => (
                    <div key={idx} className="flex justify-between py-3 border-b border-white/5 last:border-0 text-xs font-medium">
                      <span className="text-gray-400 uppercase">{row.name}</span>
                      <span className="text-white font-bold">{row.value} members</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">No active subscribers found.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
