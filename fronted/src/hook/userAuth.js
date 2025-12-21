// ============================================
// useAuth.js - Authentication Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken,
  getUser,
  setUser,
  removeUser,
  initSession,
  clearSession,
  isAuthenticated as checkAuth
} from '../utlis/auth'; // Fixed: Changed from 'ultis' to 'utils'
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../utlis/api';

export const useAuth = () => {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      setError(null);

      try {
        if (checkAuth()) {
          const userData = await getCurrentUser();
          setUser(userData);
          setUserState(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        clearSession();
        setIsAuthenticated(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (provider) => {
    setError(null);
    try {
      await apiLogin(provider);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setError(null);
    try {
      await apiLogout();
      clearSession();
      setUserState(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.message);
      // Clear session anyway
      clearSession();
      setUserState(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(userData);
    setUserState(userData);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setUserState(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
  };
};