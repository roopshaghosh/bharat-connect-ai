import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VolunteerCard from '../components/VolunteerCard';
import volunteerService from '../services/volunteerService';
import { SKILLS_LIST } from '../utils/constants';
import { Award, Code, CheckCircle, Search, Laptop, MessageSquare, Tag, RefreshCw } from 'lucide-react';

const SkillDonation = () => {
  const { user, refreshUser } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [appliedOppIds, setAppliedOppIds] = useState(new Set());
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleApplyQuick = async (opp) => {
    if (!user) {
      alert('Please log in to donate skills.');
      return;
    }
    const message = `Skill donation: Offering support for "${opp.title}" matching my profile skills.`;
    const skillsOffered = user.skills.filter(s => opp.skillsRequired.includes(s));

    try {
      const res = await volunteerService.applyForOpportunity(opp._id || opp.id, message, skillsOffered);
      if (res.success) {
        setAppliedOppIds(prev => new Set([...prev, opp._id || opp.id]));
        refreshUser();
        alert('Application submitted successfully! Host NGO will review.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  const matchedSkillsCount = user ? user.skills.filter(s => SKILLS_LIST.includes(s)).length : 0;

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
                You have <strong>{user.skills.length || 0} skills</strong> registered. Select a skill badge below to filter NGO campaigns looking specifically for your expertise!
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
                {user.skills.map(skill => (
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
              <span className="text-2xl font-black text-white">{user.skills.length}</span>
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
              onApply={handleApplyQuick}
              hasApplied={appliedOppIds.has(opp._id || opp.id)}
              isOrg={user?.role === 'organization'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillDonation;
