import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VolunteerCard from '../components/VolunteerCard';
import SearchBar from '../components/SearchBar';
import volunteerService from '../services/volunteerService';
import { OPPORTUNITY_CATEGORIES, SKILLS_LIST } from '../utils/constants';
import { Plus, X, Calendar, MapPin, Grid, Info, CheckCircle2, RefreshCw } from 'lucide-react';

const VolunteerHub = () => {
  const { user, refreshUser } = useAuth();
  
  // List State
  const [opportunities, setOpportunities] = useState([]);
  const [appliedOppIds, setAppliedOppIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    location: '',
    type: ''
  });

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  
  // Submit Form States
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    skillsRequired: [],
    location: '',
    type: 'in-person',
    date: '',
    category: 'Education'
  });
  const [applyFormData, setApplyFormData] = useState({
    message: '',
    skillsOffered: []
  });
  const [postError, setPostError] = useState('');
  const [applyError, setApplyError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await volunteerService.getOpportunities(filters);
      if (res.success) {
        setOpportunities(res.data);
      }

      // If user is volunteer, load their applications to display "Applied" state on cards
      if (user && user.role !== 'organization') {
        const appsRes = await volunteerService.getApplications();
        if (appsRes.success) {
          const applied = new Set(appsRes.data.map(app => app.opportunity?._id || app.opportunity?.id || app.opportunity));
          setAppliedOppIds(applied);
        }
      }
    } catch (err) {
      console.error('Error loading opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [filters.type]); // Reload instantly if type toggle shifts

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    loadOpportunities();
  };

  const handleReset = () => {
    setFilters({ search: '', category: 'All', location: '', type: '' });
    // setTimeout to let state clear
    setTimeout(loadOpportunities, 10);
  };

  // Open Apply Modal
  const handleApplyClick = (opp) => {
    if (!user) {
      alert('Please login to apply for volunteering opportunities.');
      return;
    }
    setSelectedOpp(opp);
    setApplyFormData({
      message: '',
      skillsOffered: user.skills || []
    });
    setIsApplyModalOpen(true);
  };

  // Submit Volunteer Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitLoading(true);
    try {
      const res = await volunteerService.applyForOpportunity(
        selectedOpp._id || selectedOpp.id,
        applyFormData.message,
        applyFormData.skillsOffered
      );
      if (res.success) {
        setAppliedOppIds(prev => new Set([...prev, selectedOpp._id || selectedOpp.id]));
        setIsApplyModalOpen(false);
        refreshUser(); // Add points if applicable
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Submit Post Opportunity
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostError('');
    if (!postFormData.title || !postFormData.description || !postFormData.location || !postFormData.date) {
      setPostError('Please fill in all required fields.');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await volunteerService.createOpportunity(postFormData);
      if (res.success) {
        setIsPostModalOpen(false);
        // Reset form
        setPostFormData({
          title: '',
          description: '',
          skillsRequired: [],
          location: '',
          type: 'in-person',
          date: '',
          category: 'Education'
        });
        loadOpportunities();
        refreshUser(); // Update host points
      }
    } catch (err) {
      setPostError(err.response?.data?.message || 'Failed to create opportunity.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Toggle skills in forms
  const toggleSkillSelection = (skill, mode) => {
    if (mode === 'post') {
      setPostFormData(prev => {
        const skills = prev.skillsRequired.includes(skill)
          ? prev.skillsRequired.filter(s => s !== skill)
          : [...prev.skillsRequired, skill];
        return { ...prev, skillsRequired: skills };
      });
    } else {
      setApplyFormData(prev => {
        const skills = prev.skillsOffered.includes(skill)
          ? prev.skillsOffered.filter(s => s !== skill)
          : [...prev.skillsOffered, skill];
        return { ...prev, skillsOffered: skills };
      });
    }
  };

  const isOrg = user?.role === 'organization';

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Volunteer Opportunities</h1>
          <p className="text-slate-400 text-xs mt-1">Discover, filter, and apply to social drives or publish new tasks.</p>
        </div>

        {isOrg && (
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Opportunity</span>
          </button>
        )}
      </div>

      {/* Advanced search bar */}
      <SearchBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Type Toggle Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        {[
          { label: 'All Formats', value: '' },
          { label: 'In-Person only', value: 'in-person' },
          { label: 'Virtual tasks', value: 'virtual' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange('type', tab.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.type === tab.value
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listing Content grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-xs">Fetching active listings...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800 text-xs text-slate-500 italic">
          No opportunities match your search parameters. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <VolunteerCard
              key={opp._id || opp.id}
              opportunity={opp}
              onApply={handleApplyClick}
              hasApplied={appliedOppIds.has(opp._id || opp.id)}
              isOrg={isOrg}
            />
          ))}
        </div>
      )}

      {/* 1. Modal: POST OPPORTUNITY (NGOs Only) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-card rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-6">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-500" />
                <span>Publish Volunteer Event</span>
              </h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error alerts */}
            {postError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl mb-4">
                {postError}
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Free Computer Literacy Camp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    value={postFormData.category}
                    onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {OPPORTUNITY_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Format *</label>
                  <select
                    value={postFormData.type}
                    onChange={(e) => setPostFormData({ ...postFormData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="in-person">In-Person Drive</option>
                    <option value="virtual">Virtual Task</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={postFormData.date}
                    onChange={(e) => setPostFormData({ ...postFormData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location/Address *</label>
                  <input
                    type="text"
                    required
                    value={postFormData.location}
                    onChange={(e) => setPostFormData({ ...postFormData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. Bandra, Mumbai or Virtual"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Description *</label>
                <textarea
                  rows="4"
                  required
                  value={postFormData.description}
                  onChange={(e) => setPostFormData({ ...postFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Describe the campaign objectives, shifts details, and volunteer expectations..."
                />
              </div>

              {/* Tag required skills */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills (Select multiple)</label>
                <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl max-h-[120px] overflow-y-auto">
                  {SKILLS_LIST.map((skill) => {
                    const isSelected = postFormData.skillsRequired.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkillSelection(skill, 'post')}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {submitLoading ? 'Creating event...' : 'Publish Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: SUBMIT APPLICATION (Volunteers Only) */}
      {isApplyModalOpen && selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-5">
              <div>
                <h3 className="text-base font-black text-white line-clamp-1">Apply to Volunteer</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Event: "{selectedOpp.title}"</p>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl mb-4">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message for Host NGO *</label>
                <textarea
                  rows="3.5"
                  required
                  value={applyFormData.message}
                  onChange={(e) => setApplyFormData({ ...applyFormData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Explain why you want to support this cause and any relevant background..."
                />
              </div>

              {/* Tag matched skills */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills You Offer (Toggle selections)</label>
                <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl max-h-[120px] overflow-y-auto">
                  {user.skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No skills registered on your profile. Set them up to auto-fill.</span>
                  ) : (
                    user.skills.map((skill) => {
                      const isSelected = applyFormData.skillsOffered.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkillSelection(skill, 'apply')}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {submitLoading ? 'Submitting request...' : 'Confirm Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerHub;
