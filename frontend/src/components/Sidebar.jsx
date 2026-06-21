import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, HeartHandshake, Award, Activity, UserCog, Heart } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Volunteer Hub', path: '/volunteer-hub', icon: HeartHandshake },
    { name: 'Skill Donation', path: '/skill-donation', icon: Award },
    { name: 'Blood Network', path: '/blood-donation', icon: Heart },
    { name: 'My Profile', path: '/profile', icon: UserCog },
  ];

  return (
    <aside className="w-64 glass-panel rounded-2xl p-5 flex flex-col space-y-6 hidden lg:flex h-[fit-content]">
      {/* User Info Header */}
      <div className="flex flex-col items-center text-center pb-5 border-b border-slate-800/80">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-indigo-500/25">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h4 className="font-bold text-white text-base truncate w-full">{user.name}</h4>
        <p className="text-xs text-slate-400 capitalize mb-1">{user.role}</p>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2.5 py-0.5 rounded-full border border-slate-700/60">
          📍 {user.location || 'Mumbai'}
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive(item.path) ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Badge Summary Tally */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Unlocked Badges</h5>
        <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
          {user.badges && user.badges.length > 0 ? (
            user.badges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 cursor-help"
                title={`${badge.title}: ${badge.description}`}
              >
                {badge.icon || '🏆'}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No badges unlocked yet.</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
