import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../utlis/auth';

// Create the context
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if there's a stored token
        const token = getAuthToken();
        const storedUser = getUser();

        if (token && storedUser) {
          // Validate token
          const isValid = checkAuth();
          
          if (isValid) {
            setUserState(storedUser);
            setIsAuthenticated(true);
          } else {
            // Token expired, clear session
            clearSession();
            setUserState(null);
            setIsAuthenticated(false);
          }
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
  const login = async (provider) => {
    setError(null);
    try {
      // Redirect to OAuth provider
      const baseUrls = {
        github: 'https://github.com/login/oauth/authorize',
        bitbucket: 'https://bitbucket.org/site/oauth2/authorize',
      };

      const clientIds = {
        github: import.meta.env.VITE_GITHUB_CLIENT_ID || process.env.REACT_APP_GITHUB_CLIENT_ID,
        bitbucket: import.meta.env.VITE_BITBUCKET_CLIENT_ID || process.env.REACT_APP_BITBUCKET_CLIENT_ID,
      };

      const redirectUri = `${window.location.origin}/auth/callback`;
      const clientId = clientIds[provider];

      if (!clientId) {
        throw new Error(`Missing client ID for provider: ${provider}`);
      }

      let authUrl;
      if (provider === 'github') {
        authUrl = `${baseUrls.github}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
      } else if (provider === 'bitbucket') {
        authUrl = `${baseUrls.bitbucket}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
    try {
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
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    setUserState(userData);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const storedUser = getUser();
      if (storedUser) {
        setUserState(storedUser);
        return storedUser;
      }
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;