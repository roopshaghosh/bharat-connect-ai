import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import { API_URL } from '../utils/constants';
import { io } from 'socket.io-client';
import { Sparkles, X } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Socket Connection and Event Listeners
  useEffect(() => {
    if (user) {
      fetchNotifications();

      const socketUrl = API_URL.replace('/api', '');
      const socketInstance = io(socketUrl);

      socketInstance.emit('register', user._id || user.id);

      socketInstance.on('notification', (newNotification) => {
        console.log('Received real-time notification via socket:', newNotification);
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        addToast(newNotification.title, newNotification.message);
      });

      return () => {
        socketInstance.disconnect();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Load user from localStorage token on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success) {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          // Token might be expired
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const responseObj = await authService.login(email, password);
      if (responseObj.success && responseObj.data) {
        localStorage.setItem('token', responseObj.data.token);
        // Exclude token from stored user object state
        const { token, ...userDataWithoutToken } = responseObj.data;
        setUser(userDataWithoutToken);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const responseObj = await authService.register(userData);
      if (responseObj.success && responseObj.data) {
        localStorage.setItem('token', responseObj.data.token);
        const { token, ...userDataWithoutToken } = responseObj.data;
        setUser(userDataWithoutToken);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData);
      if (data.success) {
        setUser(data.data);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      return { success: false, message: errMsg };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getProfile();
      if (res.success) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Error refreshing user details:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        notifications,
        unreadCount,
        fetchNotifications,
        setUnreadCount,
        setNotifications,
        addToast
      }}
    >
      {children}

      {/* Floating Toast Notification Panel */}
      <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-purple-500/35 p-4 rounded-2xl shadow-xl shadow-purple-950/20 flex items-start space-x-3.5 animate-in slide-in-from-right duration-300"
          >
            <div className="bg-purple-500/10 border border-purple-500/20 p-2 rounded-xl text-purple-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-black text-white">{toast.title}</h5>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-white transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
