import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FiSearch, FiFilter, FiUserCheck, FiUserMinus, FiTrash2,
  FiEdit, FiPlusCircle, FiDownload, FiX, FiInfo
} from 'react-icons/fi';

export default function AdminMembers() {
  const { addToast } = useToast();

  // Core States
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals States
  const [editMember, setEditMember] = useState(null);
  const [extendMember, setExtendMember] = useState(null);
  const [extendMonths, setExtendMonths] = useState('1');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== 'All' ? `&status=${statusFilter}` : '';
      const searchParam = search ? `&search=${search}` : '';
      const res = await api.get(`/members?${statusParam}${searchParam}`);
      if (res.data.success) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve member listing.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // CSV Exporter Trigger
  const handleExportCsv = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Access token cookie will automatically pass
    window.open(`${API_URL}/members/export/csv`, '_blank');
    addToast('CSV export request dispatched successfully.', 'success');
  };

  // Delete User Action
  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete member account for "${name}"?`)) return;
    try {
      const res = await api.delete(`/members/${id}`);
      if (res.data.success) {
        addToast(`Deleted member "${name}" account.`, 'success');
        fetchMembers();
      }
    } catch (err) {
      addToast('Error deleting member account.', 'error');
    }
  };

  // Toggle Suspend Action
  const handleToggleSuspend = async (member) => {
    const isSuspended = member.membershipStatus === 'suspended';
    const nextStatus = isSuspended ? 'inactive' : 'suspended';
    const confirmMsg = isSuspended
      ? `Lift suspension for "${member.name}"?`
      : `Suspend member "${member.name}"? They will be locked out of their dashboard logs.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.put(`/members/${member._id}/suspend`, { status: nextStatus });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchMembers();
      }
    } catch (err) {
      addToast('Error updating suspension status.', 'error');
    }
  };

  // Extend Membership Action
  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!extendMonths || isNaN(extendMonths) || Number(extendMonths) <= 0) {
      addToast('Enter valid month value', 'error');
      return;
    }

    try {
      const res = await api.put(`/members/${extendMember._id}/extend`, { months: Number(extendMonths) });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setExtendMember(null);
        setExtendMonths('1');
        fetchMembers();
      }
    } catch (err) {
      addToast('Failed to extend subscription.', 'error');
    }
  };

  // Edit Profile Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editMember,
        password: newPassword.trim() !== '' ? newPassword : undefined
      };
      const res = await api.put(`/members/${editMember._id}`, payload);
      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        setEditMember(null);
        setNewPassword('');
        fetchMembers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating member details', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-bold">Admin Hub</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1">Member Registry</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">
            Manage registrations, suspension parameters, manual subscription dates, and exports.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl border border-gold-500/30 hover:border-gold-500 text-xs font-bold text-gold-500 hover:bg-gold-500/5 transition-all duration-300 uppercase flex items-center gap-2 cursor-pointer"
        >
          <FiDownload />
          Export Audit Spreadsheet
        </button>
      </div>

      {/* Search and Filters panel */}
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
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gym-gray/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* Filter */}
        <div className="relative w-full sm:w-48 flex items-center bg-gym-gray/60 border border-white/10 rounded-xl px-3 text-xs text-white">
          <FiFilter className="text-gray-500 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent py-2.5 outline-none cursor-pointer border-none"
          >
            <option value="All" className="bg-gym-card text-white">All Members Status</option>
            <option value="active" className="bg-gym-card text-white">Active</option>
            <option value="pending" className="bg-gym-card text-white">Pending Verification</option>
            <option value="expired" className="bg-gym-card text-white">Expired</option>
            <option value="suspended" className="bg-gym-card text-white">Suspended</option>
            <option value="inactive" className="bg-gym-card text-white">Inactive</option>
          </select>
        </div>
      </div>

      {/* Member Table Grid */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : members.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-white/5 bg-gym-gray/40 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="py-4 px-6">Member Profile</th>
                <th className="py-4 px-6">Phone / Contact</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Active Plan</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {/* Photo & Name */}
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {member.profilePicture ? (
                        <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gold-500">{member.name[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase">{member.name}</h4>
                      <span className="text-[10px] text-gray-500">{member.email}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-6 font-medium text-gray-300">{member.phone}</td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      member.membershipStatus === 'active'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                        : member.membershipStatus === 'suspended'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                        : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                    }`}>
                      {member.membershipStatus}
                    </span>
                  </td>

                  {/* Plan */}
                  <td className="py-4 px-6 font-medium text-white uppercase">
                    {member.membershipPlan ? member.membershipPlan.name : 'None'}
                  </td>

                  {/* Expiry */}
                  <td className="py-4 px-6 font-medium text-gray-400">
                    {member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString() : 'N/A'}
                  </td>

                  {/* Actions column */}
                  <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditMember(member); setNewPassword(''); }}
                      title="Edit member details"
                      className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => setExtendMember(member)}
                      title="Extend membership dates"
                      className="p-2 rounded bg-white/5 hover:bg-white/10 text-gold-500 hover:text-gold-400 transition-colors cursor-pointer"
                    >
                      <FiPlusCircle />
                    </button>
                    <button
                      onClick={() => handleToggleSuspend(member)}
                      title={member.membershipStatus === 'suspended' ? 'Lift suspension' : 'Suspend account'}
                      className={`p-2 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${
                        member.membershipStatus === 'suspended' ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'
                      }`}
                    >
                      {member.membershipStatus === 'suspended' ? <FiUserCheck /> : <FiUserMinus />}
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member._id, member.name)}
                      title="Delete account record"
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
          <p className="text-sm text-gray-400 font-light">No members matching current criteria.</p>
        </div>
      )}

      {/* Edit Demographic Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <form
            onSubmit={handleEditSubmit}
            className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 relative flex flex-col gap-4 text-left"
          >
            <button
              type="button"
              onClick={() => setEditMember(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
              Modify Member profile details
            </h3>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Name</label>
              <input
                type="text"
                required
                value={editMember.name}
                onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Phone</label>
                <input
                  type="text"
                  required
                  value={editMember.phone}
                  onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Age</label>
                <input
                  type="number"
                  value={editMember.age || ''}
                  onChange={(e) => setEditMember({ ...editMember, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Height (cm)</label>
                <input
                  type="number"
                  value={editMember.height || ''}
                  onChange={(e) => setEditMember({ ...editMember, height: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Weight (kg)</label>
                <input
                  type="number"
                  value={editMember.weight || ''}
                  onChange={(e) => setEditMember({ ...editMember, weight: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Membership Status</label>
                <select
                  value={editMember.membershipStatus || 'inactive'}
                  onChange={(e) => setEditMember({ ...editMember, membershipStatus: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none cursor-pointer"
                >
                  <option value="active" className="bg-gym-card text-white">Active</option>
                  <option value="inactive" className="bg-gym-card text-white">Inactive</option>
                  <option value="suspended" className="bg-gym-card text-white">Suspended</option>
                  <option value="expired" className="bg-gym-card text-white">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Reset Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Blank to keep current"
                  className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold uppercase transition-colors mt-2"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Extend Membership Modal */}
      {extendMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <form
            onSubmit={handleExtendSubmit}
            className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-white/10 relative flex flex-col gap-4 text-left"
          >
            <button
              type="button"
              onClick={() => setExtendMember(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest">
              Extend membership manual dates
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Manually extend active access credentials for <strong>{extendMember.name}</strong>.
            </p>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Extension duration in Months
              </label>
              <select
                value={extendMonths}
                onChange={(e) => setExtendMonths(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-dark/60 border border-white/10 text-xs text-white focus:border-gold-500 focus:outline-none cursor-pointer"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold uppercase mt-2"
            >
              Confirm Date Extension
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
