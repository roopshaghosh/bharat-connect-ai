import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { BLOOD_GROUPS } from '../utils/constants';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    location: '',
    bloodGroup: 'Unknown',
    isBloodDonor: false,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isLogin) {
      // Login Flow
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(result.message);
      }
    } else {
      // Registration Flow
      if (!formData.name || !formData.email || !formData.password || !formData.location) {
        setErrorMsg('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Glow circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-lg glass-card p-8 rounded-3xl relative z-10 border border-slate-800 shadow-2xl">
        {/* Toggle Headings */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-slate-900 border border-slate-800 p-1 rounded-xl mb-4">
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                !isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>{isLogin ? 'Welcome Back' : 'Join Bharat Connect'}</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1.5">
            {isLogin
              ? 'Enter your credentials to enter your impact space.'
              : 'Create a profile to begin your social impact and AI matching journey.'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/25 p-4.5 rounded-xl text-red-400 text-xs font-semibold mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Rohan Sharma"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="rohan@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              {/* Profile setup: Location */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location (City/State) *</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Mumbai"
                />
              </div>

              {/* Role Toggle: User vs NGO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">I am an *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="user">Volunteer Donor</option>
                    <option value="organization">NGO / Organizer</option>
                  </select>
                </div>

                {formData.role === 'user' && (
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
                )}
              </div>

              {/* Blood donor willing toggles */}
              {formData.role === 'user' && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isBloodDonor"
                    name="isBloodDonor"
                    checked={formData.isBloodDonor}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-850 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="isBloodDonor" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Willing to receive/respond to emergency blood requests
                  </label>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLogin ? <LogIn className="w-4.5 h-4.5" /> : <UserPlus className="w-4.5 h-4.5" />}
            <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
