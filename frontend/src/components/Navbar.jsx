import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, LogOut, Menu, X, HeartHandshake, User, LogIn, Sparkles, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Volunteer Hub', path: '/volunteer-hub' },
    { name: 'Skill Donation', path: '/skill-donation' },
    { name: 'Blood Network', path: '/blood-donation' },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2.5">
        <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
          <Sparkles className="w-5.5 h-5.5 animate-pulse" />
        </div>
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
          Bharat Connect <span className="text-blue-500 font-black">AI</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-7">
        {user && (
          <Link
            to="/dashboard"
            className={`text-sm font-semibold tracking-wide transition-colors ${
              isActive('/dashboard') ? 'text-blue-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
        )}
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-semibold tracking-wide transition-colors ${
              isActive(link.path) ? 'text-blue-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* User Actions */}
      <div className="hidden md:flex items-center space-x-4">
        {user ? (
          <>
            {/* Impact score pill */}
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-400 neon-glow-primary">
              <Award className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
              <span>{user.impactScore || 0} Impact XP</span>
            </div>

            {/* Profile trigger */}
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-slate-300 hover:text-white text-sm bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{user.name}</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4.5 py-2 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Join Now</span>
          </Link>
        )}
      </div>

      {/* Mobile Menu Trigger */}
      <div className="md:hidden flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full text-[11px] font-bold text-blue-400">
            <Award className="w-3 h-3 text-yellow-400" />
            <span>{user.impactScore} XP</span>
          </div>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-300 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-[61px] left-0 w-full glass-panel py-6 px-6 flex flex-col space-y-4 shadow-2xl border-t border-slate-800 animate-in fade-in slide-in-from-top-3 duration-250 md:hidden">
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 px-3 rounded-lg ${
                isActive('/dashboard') ? 'bg-blue-600/15 text-blue-400' : 'text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              Dashboard
            </Link>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 px-3 rounded-lg ${
                isActive(link.path) ? 'bg-blue-600/15 text-blue-400' : 'text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <hr className="border-slate-800/70" />

          {user ? (
            <div className="flex flex-col space-y-3 pt-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-slate-800/40"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{user.name} (Profile)</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/5 text-left font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Now</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
