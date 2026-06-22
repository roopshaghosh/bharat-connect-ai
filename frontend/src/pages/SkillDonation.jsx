import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VolunteerCard from '../components/VolunteerCard';
import volunteerService from '../services/volunteerService';
import { SKILLS_LIST } from '../utils/constants';
import { Award, Laptop, Tag, RefreshCw, X } from 'lucide-react';

const SkillDonation = () => {
  const { user, refreshUser } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [appliedOppIds, setAppliedOppIds] = useState(new Set());
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [applyFormData, setApplyFormData] = useState({
    message: '',
    skillsOffered: []
  });
  const [applyError, setApplyError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Load opportunities specifically filtered by category/type that fits "skills"
  const loadSkillOpportunities = async () => {
    setLoading(true);
    try {
      // Fetch open opportunities
      const res = await volunteerService.getOpportunities();
      if (res.success) {
        // Filter: Virtual opportunities or category in tech/design/education
        let data = res.data;
        if (selectedSkill) {
          data = data.filter(opp => 
            opp.skillsRequired?.some(s => s.toLowerCase() === selectedSkill.toLowerCase())
          );
        }
        setOpportunities(data);
      }

      // Load user applied set
      if (user && user.role !== 'organization') {
        const appsRes = await volunteerService.getApplications();
        if (appsRes.success) {
          const applied = new Set(appsRes.data.map(app => app.opportunity?._id || app.opportunity?.id || app.opportunity));
          setAppliedOppIds(applied);
        }
      }
    } catch (err) {
      console.error('Error loading skill opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkillOpportunities();
  }, [selectedSkill, user]);

  const handleApplyClick = (opp) => {
    if (!user) {
      alert('Please log in to donate skills.');
      return;
    }
    setSelectedOpp(opp);
    setApplyFormData({
      message: '',
      skillsOffered: user.skills ? user.skills.filter(s => opp.skillsRequired.includes(s)) : []
    });
    setApplyError('');
    setIsApplyModalOpen(true);
  };

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
        refreshUser();
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleSkillSelection = (skill) => {
    setApplyFormData(prev => {
      const skills = prev.skillsOffered.includes(skill)
        ? prev.skillsOffered.filter(s => s !== skill)
        : [...prev.skillsOffered, skill];
      return { ...prev, skillsOffered: skills };
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-purple-400" />
            <span>Skill Donation Hub</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Contribute specialized professional skills (Teaching, Web Development, Design, First Aid) virtually or in-person.
          </p>
        </div>
      </div>

      {/* Profile matched skills visualizer */}
      {user && user.role !== 'organization' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                <Laptop className="w-4 h-4" />
                <span>My Profile Skills Matrix</span>
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                You have <strong>{user.skills?.length || 0} skills</strong> registered. Select a skill badge below to filter NGO campaigns looking specifically for your expertise!
              </p>
              
              {/* Profile skills badges list */}
              <div className="flex flex-wrap gap-2 pt-3">
                <button
                  onClick={() => setSelectedSkill('')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    !selectedSkill 
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/10' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Skill Openings
                </button>
                {(user.skills || []).map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      selectedSkill === skill 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/10' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎓 {skill}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Visual KPI */}
            <div className="bg-slate-900 border border-slate-850 p-4.5 rounded-2xl text-center shrink-0 w-full md:w-auto">
              <span className="text-2xl font-black text-white">{user.skills?.length || 0}</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Registered Skills</p>
            </div>
          </div>
        </div>
      )}

      {/* Skills filter grid */}
      {!user && (
        <div className="flex flex-wrap gap-1.5 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 mr-2 font-bold flex items-center"><Tag className="w-3.5 h-3.5 mr-1" /> Filter by Skill:</span>
          {['Teaching', 'Web Development', 'UI Design', 'First Aid', 'Figma', 'Social Media'].map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                selectedSkill === skill 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* Opp Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-xs">Matching skill datasets...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800 text-xs text-slate-500 italic">
          No skill donation requests currently match "{selectedSkill || 'filters'}". Try another tag!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <VolunteerCard
              key={opp._id || opp.id}
              opportunity={opp}
              onApply={handleApplyClick}
              hasApplied={appliedOppIds.has(opp._id || opp.id)}
              isOrg={user?.role === 'organization'}
            />
          ))}
        </div>
      )}

      {/* Modal: SUBMIT APPLICATION (Volunteers Only) */}
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
                  {!user.skills || user.skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No skills registered on your profile. Set them up to auto-fill.</span>
                  ) : (
                    user.skills.map((skill) => {
                      const isSelected = applyFormData.skillsOffered.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkillSelection(skill)}
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

export default SkillDonation;
