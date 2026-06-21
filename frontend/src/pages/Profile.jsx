import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AchievementCard from '../components/AchievementCard';
import { SKILLS_LIST, INTERESTS_LIST, BLOOD_GROUPS } from '../utils/constants';
import { Save, User, Award, Tag, Sparkles, MapPin, Activity, CheckSquare } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    bloodGroup: 'Unknown',
    isBloodDonor: false,
    skills: [],
    interests: [],
    availability: 'flexible'
  });
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Initialize form from state
    setFormData({
      name: user.name || '',
      location: user.location || '',
      bloodGroup: user.bloodGroup || 'Unknown',
      isBloodDonor: user.isBloodDonor || false,
      skills: user.skills || [],
      interests: user.interests || [],
      availability: user.availability || 'flexible'
    });
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle skills in tags multiselect list
  const toggleSkill = (skill) => {
    setFormData(prev => {
      const list = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: list };
    });
  };

  // Toggle interests in tags multiselect list
  const toggleInterest = (interest) => {
    setFormData(prev => {
      const list = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: list };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaveLoading(true);

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile tags and settings saved successfully! AI matching models updated.');
        await refreshUser(); // Fetch updated details to load level/badges
      } else {
        setErrorMsg(res.message || 'Error saving profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user) return null;
  const isOrg = user.role === 'organization';

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-12">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Form content */}
      <div className="flex-1 space-y-8">
        {/* Header summary panel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <User className="w-5.5 h-5.5 text-blue-400" />
              <span>Edit Profile & AI Tags</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure your skillset tags and location parameters for precision AI matching.</p>
          </div>
        </div>

        {/* Success/Error alert alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-xl">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1 text-slate-400">
              <span>Basic Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location (City/State) *</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Blood Donation setting configuration (Volunteers only) */}
            {!isOrg && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Unknown">Choose...</option>
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weekly Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="flexible">Flexible</option>
                    <option value="weekends">Weekends only</option>
                    <option value="weekdays">Weekdays only</option>
                    <option value="evenings">Evenings</option>
                  </select>
                </div>

                <div className="md:col-span-2 pt-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isBloodDonor"
                    name="isBloodDonor"
                    checked={formData.isBloodDonor}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-850 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="isBloodDonor" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Yes, register me as an active donor to receive emergency blood requests matching my blood group
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: AI Skills & Interests Tags (Volunteers only) */}
          {!isOrg && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Tags */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 text-purple-400">
                  <Tag className="w-4.5 h-4.5" />
                  <span>Configure Skills Tags</span>
                </h3>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  Select professional skills you are willing to donate (Teaching, Web Development, Design, first aid).
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto p-2 border border-slate-850 rounded-xl bg-slate-950/20">
                  {SKILLS_LIST.map((skill) => {
                    const isSelected = formData.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interests Tags */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 text-indigo-400">
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>Configure Interests Tags</span>
                </h3>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  Select social causes you feel strongly about (Education, Environment, Disaster Relief).
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto p-2 border border-slate-850 rounded-xl bg-slate-950/20">
                  {INTERESTS_LIST.map((interest) => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-indigo-650 border-indigo-500 text-white shadow-md shadow-indigo-650/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Form Submit Save button */}
          <button
            type="submit"
            disabled={saveLoading}
            className="w-full md:w-56 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ml-auto"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{saveLoading ? 'Saving...' : 'Save Profiles & Tags'}</span>
          </button>
        </form>

        {/* Section 3: Achievements Showcase */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 text-yellow-400">
            <Award className="w-5 h-5 animate-pulse" />
            <span>My Unlocked Achievements & Badges</span>
          </h3>

          {user.badges && user.badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.badges.map((badge, idx) => (
                <AchievementCard key={idx} badge={badge} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500 italic">
              Complete volunteering opportunities or offer blood donations to unlock achievement badges!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
