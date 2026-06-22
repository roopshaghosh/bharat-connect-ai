import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, LogOut, Menu, X, HeartHandshake, User, LogIn, Sparkles, Activity, Bell } from 'lucide-react';
import notificationService from '../services/notificationService';

const Navbar = () => {
  const { user, logout, notifications, unreadCount, setNotifications, setUnreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadList = notifications.filter(n => !n.read);
      await Promise.all(unreadList.map(n => notificationService.markAsRead(n._id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
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
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-400 neon-glow-primary shrink-0">
              <Award className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
              <span>{user.impactScore || 0} Impact XP</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/60 rounded-lg relative flex items-center justify-center border border-transparent hover:border-slate-700/50"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950 shrink-0">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-4 z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-[11px] text-slate-500 italic">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                            notification.read
                              ? 'bg-slate-900/30 border-slate-900/60 hover:bg-slate-900/50'
                              : 'bg-indigo-500/5 border-indigo-500/15 hover:bg-indigo-500/10'
                          }`}
                        >
                          {!notification.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 animate-pulse" />
                          )}
                          <div className="flex-1 min-w-0 text-left">
                            <h5 className={`text-[11px] font-bold ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                              {notification.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed break-words">
                              {notification.message}
                            </p>
                            <span className="text-[8px] text-slate-500 mt-1 block">
                              {new Date(notification.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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

          {user && (
            <div className="border border-slate-800 rounded-2xl p-3 bg-slate-900/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-400" /> Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[9px] text-blue-400 font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic text-center py-2">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 3).map(notification => (
                    <div
                      key={notification._id}
                      onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                      className={`p-2 rounded-xl text-left text-[10px] border cursor-pointer ${
                        notification.read
                          ? 'bg-slate-900/30 border-slate-900/60'
                          : 'bg-indigo-500/5 border-indigo-500/15'
                      }`}
                    >
                      <h6 className={`font-bold ${notification.read ? 'text-slate-350' : 'text-white'}`}>{notification.title}</h6>
                      <p className="text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

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
