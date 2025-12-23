// Authentication utility functions for PitCrew AI Review

// Environment variables - supports both Vite and CRA
const getEnvVar = (key) => {
  // Try Vite first (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`];
  }
  // Fallback to Create React App (process.env)
  return process.env[`REACT_APP_${key}`];
};

const GITHUB_CLIENT_ID = getEnvVar('GITHUB_CLIENT_ID');
const BITBUCKET_CLIENT_ID = getEnvVar('BITBUCKET_CLIENT_ID');
const API_URL = getEnvVar('API_URL') || 'http://localhost:8000';
const REDIRECT_URI = getEnvVar('REDIRECT_URI') || `${window.location.origin}/auth/callback`;


// Token management
export const setAuthToken = (token) => {
  if (!token) {
    console.error('Attempted to set null/undefined token');
    return;
  }
  localStorage.setItem('access_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  // Check if token is expired
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};



// User data management
export const setUser = (user) => {
  if (!user) {
    console.error('Attempted to set null/undefined user');
    return;
  }
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

// JWT parsing
export const parseJWT = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
};

// OAuth helpers
export const getOAuthUrl = (provider = 'github') => {
  const baseUrls = {
    github: 'https://github.com/login/oauth/authorize',
    bitbucket: 'https://bitbucket.org/site/oauth2/authorize',
  };

  const clientIds = {
    github: GITHUB_CLIENT_ID,
    bitbucket: BITBUCKET_CLIENT_ID,
  };

  const clientId = clientIds[provider];

  // Validate client ID
  if (!clientId || clientId === 'undefined') {
    const errorMsg = `Missing or invalid client ID for ${provider}. Please check your .env file for VITE_${provider.toUpperCase()}_CLIENT_ID`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Add state for CSRF protection
  const state = setOAuthState();
  
  // Store provider
  setAuthProvider(provider);

  if (provider === 'github') {
    const scope = 'repo user:email read:user';
    return `${baseUrls.github}?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  } else if (provider === 'bitbucket') {
    return `${baseUrls.bitbucket}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
  }

  throw new Error(`Unsupported provider: ${provider}`);
};

export const extractAuthCode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

export const extractAuthError = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('error') || params.get('error_description');
};

export const extractAuthState = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('state');
};

export const getAuthProvider = () => {
  // Determine provider from stored data or URL
  const params = new URLSearchParams(window.location.search);
  return params.get('provider') || localStorage.getItem('auth_provider') || 'github';
};

export const setAuthProvider = (provider) => {
  localStorage.setItem('auth_provider', provider);
};

// API helpers
export const getApiUrl = () => API_URL;

export const getRedirectUri = () => REDIRECT_URI;

export const getClientId = (provider = 'github') => {
  return provider === 'github' ? GITHUB_CLIENT_ID : BITBUCKET_CLIENT_ID;
};

// Validate environment configuration
export const validateEnvironment = () => {
  const errors = [];
  
  if (!GITHUB_CLIENT_ID || GITHUB_CLIENT_ID === 'undefined') {
    errors.push('GITHUB_CLIENT_ID is not configured');
  }
  
  if (!API_URL) {
    errors.push('VITE_API_URL is not configured');
  }
  
  if (!REDIRECT_URI) {
    errors.push('GITHUB_REDIRECT_URI is not configured');
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      GITHUB_CLIENT_ID: GITHUB_CLIENT_ID ? '✓ Set' : '✗ Missing',
      BITBUCKET_CLIENT_ID: BITBUCKET_CLIENT_ID ? '✓ Set' : '✗ Missing',
      API_URL: API_URL || '✗ Missing',
      REDIRECT_URI: REDIRECT_URI || '✗ Missing',
    }
  };
};

// Permission checks
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

// Session management
export const initSession = (token, user, provider = 'github') => {
  setAuthToken(token);
  setUser(user);
  setAuthProvider(provider);
  
  // Log successful authentication
  console.log('Session initialized for user:', user.username || user.email);
};

export const clearSession = () => {
  removeAuthToken();
  removeUser();
  localStorage.removeItem('auth_provider');
  sessionStorage.clear();
  
  console.log('Session cleared');
};

export const refreshSession = async () => {
  const token = getAuthToken();
  if (!token) {
    console.log('No token found for refresh');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        setAuthToken(data.token);
        return true;
      }
    }
    
    // If refresh fails, check if current token is still valid
    return isAuthenticated();
  } catch (error) {
    console.error('Failed to refresh session:', error);
    
    // If refresh fails but token is still valid, keep session
    if (isAuthenticated()) {
      return true;
    }
    
    clearSession();
    return false;
  }
};

// Security utilities
export const generateState = () => {
  // Generate a random state for CSRF protection
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const validateState = (state) => {
  const storedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  
  if (!state || !storedState) {
    console.warn('Missing state parameter for validation');
    return false;
  }
  
  return state === storedState;
};

export const setOAuthState = () => {
  const state = generateState();
  sessionStorage.setItem('oauth_state', state);
  return state;
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'medium';
  return 'strong';
};

// Redirect helpers
export const getRedirectPath = () => {
  return sessionStorage.getItem('redirect_after_login') || '/dashboard';
};

export const setRedirectPath = (path) => {
  sessionStorage.setItem('redirect_after_login', path);
};

export const clearRedirectPath = () => {
  sessionStorage.removeItem('redirect_after_login');
};

export const redirectAfterLogin = (navigate) => {
  const path = getRedirectPath();
  clearRedirectPath();
  navigate(path);
};



// Handle OAuth callback
export const handleOAuthCallback = async (navigate) => {
  const code = extractAuthCode();
  const state = extractAuthState();
  const error = extractAuthError();
  const provider = getAuthProvider();

  // Check for errors from OAuth provider
  if (error) {
    console.error('OAuth error:', error);
    return {
      success: false,
      error: `Authentication failed: ${error}`
    };
  }

  // Validate code exists
  if (!code) {
    return {
      success: false,
      error: 'No authorization code received'
    };
  }

  // Validate CSRF state
  if (!validateState(state)) {
    console.error('State validation failed - possible CSRF attack');
    return {
      success: false,
      error: 'Security validation failed. Please try again.'
    };
  }

  try {
    // Exchange code for token
    const response = await fetch(`${API_URL}/api/auth/${provider}/callback/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.detail || 'Authentication failed');
    }

    const data = await response.json();

    // Validate response data
    if (!data.token || !data.user) {
      throw new Error('Invalid response from server');
    }

    // Initialize session
    initSession(data.token, data.user, provider);

    // Redirect to intended page
    redirectAfterLogin(navigate);

    return {
      success: true,
      user: data.user
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};



// Export default object with all functions
export default {
  // Token management
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
  
  // User management
  setUser,
  getUser,
  removeUser,
  
  // JWT
  parseJWT,
  
  // OAuth
  getOAuthUrl,
  extractAuthCode,
  extractAuthError,
  extractAuthState,
  getAuthProvider,
  setAuthProvider,
  handleOAuthCallback,
  
  // Config
  getApiUrl,
  getRedirectUri,
  getClientId,
  validateEnvironment,
  
  // Permissions
  hasPermission,
  hasRole,
  
  // Session
  initSession,
  clearSession,
  refreshSession,
  
  // Security
  generateState,
  validateState,
  setOAuthState,
  validatePassword,
  
  // Redirects
  getRedirectPath,
  setRedirectPath,
  clearRedirectPath,
  redirectAfterLogin,
};