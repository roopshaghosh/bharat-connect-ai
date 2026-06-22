import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      }}
    >
      {children}
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
