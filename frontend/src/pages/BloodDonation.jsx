import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BloodRequestCard from '../components/BloodRequestCard';
import bloodDonationService from '../services/bloodDonationService';
import { BLOOD_GROUPS } from '../utils/constants';
import { Plus, X, Activity, RefreshCw, Heart, MapPin, Grid, ShieldAlert, Check } from 'lucide-react';

const BloodDonation = () => {
  const { user, refreshUser } = useAuth();

  // List State
  const [requests, setRequests] = useState([]);
  const [committedIds, setCommittedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    bloodGroup: 'All',
    location: ''
  });

  // Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsNeeded: 1,
    hospital: '',
    location: '',
    contactNumber: '',
    urgency: 'medium'
  });
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadBloodRequests = async () => {
    setLoading(true);
    try {
      const res = await bloodDonationService.getRequests(filters);
      if (res.success) {
        setRequests(res.data);
      }

      // Track requests user has already offered to donate for
      if (user) {
        const userId = user._id || user.id;
        const committed = new Set(
          res.data
            .filter(req => req.responses?.some(resp => resp.donor?._id === userId || resp.donor === userId))
            .map(req => req._id || req.id)
        );
        setCommittedIds(committed);
      }
    } catch (err) {
      console.error('Error loading blood requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBloodRequests();
  }, [filters.bloodGroup]); // Auto-reload on dropdown select

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Submit Offer to Donate Blood
  const handleCanDonate = async (requestId) => {
    if (!user) {
      alert('Please login to offer blood donations.');
      return;
    }
    if (user.bloodGroup === 'Unknown') {
      alert('Please set up your blood group in your Profile page before committing to donate.');
      return;
    }
    try {
      const res = await bloodDonationService.respondToRequest(requestId);
      if (res.success) {
        setCommittedIds(prev => new Set([...prev, requestId]));
        loadBloodRequests(); // Refresh responses count
        refreshUser(); // Update donor points / badges
        alert('Thank you! Your donation offer has been registered. The hospital/relative will contact you.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting response.');
    }
  };

  // Submit Blood Request Form
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.patientName || !formData.hospital || !formData.location || !formData.contactNumber) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await bloodDonationService.createRequest(formData);
      if (res.success) {
        setIsRequestModalOpen(false);
        // Reset form
        setFormData({
          patientName: '',
          bloodGroup: 'O+',
          unitsNeeded: 1,
          hospital: '',
          location: '',
          contactNumber: '',
          urgency: 'medium'
        });
        loadBloodRequests();
        refreshUser();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit blood request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Organization/Poster Fulfills request
  const handleFulfillRequest = async (requestId) => {
    try {
      const res = await bloodDonationService.updateRequestStatus(requestId, 'fulfilled');
      if (res.success) {
        loadBloodRequests();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const isVolunteer = user?.role === 'user';
  const userId = user?._id || user?.id;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
            <span>Emergency Blood Network</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Intelligently bridges critical blood emergencies near you.</p>
        </div>

        {user && (
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Post Blood Request</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col md:flex-row gap-4 items-center">
        {/* Blood group dropdown */}
        <div className="relative w-full md:w-56">
          <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <select
            value={filters.bloodGroup}
            onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-red-500/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="All">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {/* Location filter */}
        <div className="relative w-full md:flex-1">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search city/area..."
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadBloodRequests()}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => { setFilters({ bloodGroup: 'All', location: '' }); setTimeout(loadBloodRequests, 10); }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 rounded-xl transition-colors text-xs font-bold"
          >
            Clear
          </button>
          <button
            onClick={loadBloodRequests}
            className="px-6 py-2.5 bg-red-650 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/15"
          >
            Search Network
          </button>
        </div>
      </div>

      {/* Donor Callout alert banner */}
      {isVolunteer && user.isBloodDonor && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 p-4.5 rounded-2xl flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-emerald-300 font-bold text-xs">You are registered as a Donor!</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Active requests matching your blood group ({user.bloodGroup}) will be highlighted. Responding grants +30 XP!
            </p>
          </div>
        </div>
      )}

      {/* Listing requests grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-xs">Checking live blood network...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800 text-xs text-slate-500 italic">
          No blood emergency requests found. Post a request if you need support.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req._id || req.id} className="relative">
              <BloodRequestCard
                request={req}
                onRespond={handleCanDonate}
                hasResponded={committedIds.has(req._id || req.id)}
                isOwner={req.postedBy?._id === userId || req.postedBy === userId}
              />
              
              {/* If owner, allow marking as Fulfilled */}
              {req.status === 'pending' && (req.postedBy?._id === userId || req.postedBy === userId) && (
                <button
                  onClick={() => handleFulfillRequest(req._id || req.id)}
                  className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                >
                  Mark Fulfilled
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: POST BLOOD REQUEST */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-6">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span>Submit Blood Request</span>
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form errors */}
            {formError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="Karan Mehra"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Units Needed *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.unitsNeeded}
                    onChange={(e) => setFormData({ ...formData, unitsNeeded: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hospital Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="e.g. Kokilaben Hospital"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Area / City *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="e.g. Andheri, Mumbai"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Urgency Level *</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  >
                    <option value="low">Low Urgency</option>
                    <option value="medium">Medium Urgency</option>
                    <option value="high">High Urgency</option>
                    <option value="critical">Critical Emergency 🚨</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3.5 bg-red-650 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-650/15 disabled:opacity-50"
              >
                {submitLoading ? 'Broadcasting emergency request...' : 'Broadcast Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonation;
