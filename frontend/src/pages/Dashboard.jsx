import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RecommendationCard from '../components/RecommendationCard';
import AchievementCard from '../components/AchievementCard';
import { Award, Clock, FileCheck, CheckCircle2, RefreshCw, BrainCircuit, HeartHandshake, ShieldAlert, Sparkles, User, Calendar } from 'lucide-react';
import authService from '../services/authService';
import aiService from '../services/aiService';
import volunteerService from '../services/volunteerService';
import bloodDonationService from '../services/bloodDonationService';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    impactScore: 0,
    badges: [],
    totalApplications: 0,
    approvedApplications: 0,
    volunteerHoursEstimated: 0
  });
  const [recommendations, setRecommendations] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [oppsMap, setOppsMap] = useState({});
  const [bloodMap, setBloodMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Impact Stats
      const statsRes = await authService.getImpact();
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // 2. Fetch Applications
      const appsRes = await volunteerService.getApplications();
      if (appsRes.success) {
        setApplications(appsRes.data);
      }

      // 3. Fetch Opportunities & Blood requests to map recommendation IDs
      const oppsRes = await volunteerService.getOpportunities();
      const bloodRes = await bloodDonationService.getRequests();

      const oMap = {};
      if (oppsRes.success) {
        oppsRes.data.forEach(o => { oMap[o._id || o.id] = o; });
      }
      const bMap = {};
      if (bloodRes.success) {
        bloodRes.data.forEach(b => { bMap[b._id || b.id] = b; });
      }
      setOppsMap(oMap);
      setBloodMap(bMap);

      // 4. Fetch AI recommendations
      await fetchAIRecommendations();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIRecommendations = async () => {
    if (!user || !user.skills || user.skills.length === 0) return;
    setAiLoading(true);
    try {
      const res = await aiService.getRecommendations();
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error('Error fetching AI matching:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle Application approval/rejection (Orgs)
  const handleApproveStatus = async (appId, newStatus) => {
    try {
      const res = await volunteerService.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        // Refresh local items
        setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
        refreshUser(); // Updates org's points
        const statsRes = await authService.getImpact();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Match routing inside AI card onView
  const handleViewRecommendation = (rec) => {
    if (rec.type === 'opp') {
      navigate('/volunteer-hub');
    } else {
      navigate('/blood-donation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading your impact universe...</p>
        </div>
      </div>
    );
  }

  const isOrg = user?.role === 'organization';

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-12">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 space-y-8">
        {/* User Welcome Block */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5.5 h-5.5 text-blue-400" />
              <span>Namaste, {user?.name}!</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isOrg
                ? 'Manage your volunteer requests, review applications, and coordinate community events.'
                : 'Here is your central social space. Track accomplishments and discover new matched causes.'}
            </p>
          </div>
          {!isOrg && (
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-950/20 border border-blue-900/35 px-4 py-2 rounded-xl text-xs font-bold text-blue-300">
              <span>Impact Score Level: {Math.floor(stats.impactScore / 50) + 1}</span>
            </div>
          )}
        </div>

        {/* Stats Section grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Award} value={`${stats.impactScore} XP`} label="Total Impact XP" color="yellow" subtext="Accumulated points" />
          <StatCard icon={Clock} value={`${stats.volunteerHoursEstimated} Hrs`} label="Hours Estimated" color="blue" subtext="Time contributed to causes" />
          <StatCard icon={FileCheck} value={stats.totalApplications} label={isOrg ? 'Review Requested' : 'Opportunities Applied'} color="purple" subtext="Total applications" />
          <StatCard icon={CheckCircle2} value={stats.approvedApplications} label={isOrg ? 'Requests Approved' : 'Approved Shifts'} color="green" subtext="Successful approvals" />
        </div>

        {/* AI Matches Block (Only for Volunteers) */}
        {!isOrg && (
          <div className="glass-panel p-6 rounded-3xl border-purple-500/20">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">AI Personalized Matches</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Semantic matching analyzing your skills, location, and blood donor tags.</p>
                </div>
              </div>

              {user?.skills && user.skills.length > 0 && (
                <button
                  onClick={fetchAIRecommendations}
                  disabled={aiLoading}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 transition-colors"
                  title="Recalculate AI matches"
                >
                  <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {(!user?.skills || user.skills.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <ShieldAlert className="w-8 h-8 text-yellow-400 mb-3" />
                <h5 className="font-bold text-white text-sm mb-1">Set Up Your Profile Tags</h5>
                <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                  We need your skills, interests, and location tags to run the AI Matcher.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                  Configure Profile Now
                </button>
              </div>
            ) : recommendations ? (
              <div className="space-y-6">
                {/* Profile Summary text */}
                <p className="text-xs text-slate-300 bg-slate-900/60 border border-slate-800 p-4 rounded-xl leading-relaxed italic">
                  "{recommendations.profileAnalysis}"
                </p>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Map Volunteer Matches */}
                  {recommendations.volunteerMatches && recommendations.volunteerMatches.slice(0, 2).map((rec, idx) => {
                    const opp = oppsMap[rec.opportunityId];
                    if (!opp) return null;
                    return (
                      <RecommendationCard
                        key={`vol-${idx}`}
                        recommendation={rec}
                        opportunity={opp}
                        onView={handleViewRecommendation}
                      />
                    );
                  })}

                  {/* Map Blood Matches */}
                  {recommendations.bloodMatches && recommendations.bloodMatches.slice(0, 1).map((rec, idx) => {
                    const blood = bloodMap[rec.requestId];
                    if (!blood) return null;
                    return (
                      <RecommendationCard
                        key={`blood-${idx}`}
                        recommendation={rec}
                        bloodRequest={blood}
                        onView={handleViewRecommendation}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                AI Match engine is ready. Click the refresh button or update your profile tags to load matches.
              </div>
            )}
          </div>
        )}

        {/* Applications / Management panel */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-blue-500" />
            <span>{isOrg ? 'Manage Incoming Applications' : 'My Volunteering Applications'}</span>
          </h3>

          {applications.length === 0 ? (
            <div className="text-center p-8 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500 italic">
              {isOrg 
                ? 'No volunteers have applied to your active postings yet.' 
                : 'You have not submitted any volunteering applications. Go to Volunteer Hub to explore!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3.5 pr-4">{isOrg ? 'Volunteer Details' : 'Opportunity Details'}</th>
                    <th className="pb-3.5 px-4">Date</th>
                    <th className="pb-3.5 px-4">Status</th>
                    {isOrg && <th className="pb-3.5 px-4">Message / Skills</th>}
                    {isOrg && <th className="pb-3.5 pl-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-900/25 transition-colors">
                      {/* Left: Volunteer / Opportunity detail */}
                      <td className="py-4 pr-4">
                        {isOrg ? (
                          <div>
                            <div className="font-bold text-white flex items-center space-x-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{app.volunteer?.name}</span>
                            </div>
                            <div className="text-slate-400 text-[10px] mt-0.5">
                              Email: {app.volunteer?.email} • XP: {app.volunteer?.impactScore || 0}
                            </div>
                            <div className="text-[10px] text-blue-400 mt-1 font-semibold">
                              For: "{app.opportunity?.title}"
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-white leading-tight">
                              {app.opportunity?.title}
                            </div>
                            <div className="text-slate-400 text-[10px] mt-1">
                              Category: {app.opportunity?.category} • {app.opportunity?.type}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-300 font-medium shrink-0">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          {new Date(app.opportunity?.date || app.appliedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : app.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/25'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Message (Orgs only) */}
                      {isOrg && (
                        <td className="py-4 px-4 text-slate-400 max-w-[200px]">
                          <p className="line-clamp-2 italic">"{app.message || 'No message provided.'}"</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {app.skillsOffered && app.skillsOffered.map((sk, idx) => (
                              <span key={idx} className="text-[8px] bg-slate-800 text-slate-300 px-1 rounded">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}

                      {/* Action buttons (Orgs only) */}
                      {isOrg && (
                        <td className="py-4 pl-4 text-right">
                          {app.status === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApproveStatus(app._id, 'rejected')}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors font-bold"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApproveStatus(app._id, 'approved')}
                                className="bg-emerald-600 hover:bg-emerald-550 text-white px-3 py-1.5 rounded-lg transition-all font-bold shadow-md shadow-emerald-600/15"
                              >
                                Approve
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Decision Made</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
