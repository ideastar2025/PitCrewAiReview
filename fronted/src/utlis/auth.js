// Authentication utility functions

// Token management
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  // Check if token is expired
  try {
    const payload = parseJWT(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

// User data management
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

// JWT parsing
export const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
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
export const getOAuthUrl = (provider) => {
  const baseUrls = {
    github: 'https://github.com/login/oauth/authorize',
    bitbucket: 'https://bitbucket.org/site/oauth2/authorize',
  };

  const clientIds = {
    github: process.env.REACT_APP_GITHUB_CLIENT_ID,
    bitbucket: process.env.REACT_APP_BITBUCKET_CLIENT_ID,
  };

  const redirectUri = `${window.location.origin}/auth/callback`;
  const clientId = clientIds[provider];

  if (!clientId) {
    throw new Error(`Missing client ID for provider: ${provider}`);
  }

  if (provider === 'github') {
    return `${baseUrls.github}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
  } else if (provider === 'bitbucket') {
    return `${baseUrls.bitbucket}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  }

  throw new Error(`Unsupported provider: ${provider}`);
};

export const extractAuthCode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

export const getAuthProvider = () => {
  // Determine provider from stored data or URL
  const params = new URLSearchParams(window.location.search);
  return params.get('provider') || localStorage.getItem('auth_provider') || 'github';
};

export const setAuthProvider = (provider) => {
  localStorage.setItem('auth_provider', provider);
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
export const initSession = (token, user) => {
  setAuthToken(token);
  setUser(user);
  setAuthProvider(user.provider || 'github');
};

export const clearSession = () => {
  removeAuthToken();
  removeUser();
  localStorage.removeItem('auth_provider');
};

export const refreshSession = async () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // In a real app, you'd call a refresh endpoint
    // const response = await fetch('/api/auth/refresh', { ... });
    return isAuthenticated();
  } catch (error) {
    console.error('Failed to refresh session:', error);
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
  getAuthProvider,
  setAuthProvider,
  
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