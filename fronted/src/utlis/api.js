// API Base Configuration
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }

  return headers;
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...createHeaders(options.includeAuth !== false),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      const error = isJson ? await response.json() : { message: response.statusText };
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return isJson ? await response.json() : await response.text();
  } catch (error) {
    console.error(`API Request failed: ${endpoint}`, error);
    throw error;
  }
};

// ============================================
// Authentication API
// ============================================

export const login = async (provider) => {
  // Redirect to OAuth flow
  const clientId = provider === 'github'
    ? import.meta.env.REACT_APP_GITHUB_CLIENT_ID
    : import.meta.env.REACT_APP_BITBUCKET_CLIENT_ID;

  const redirectUri = `${window.location.origin}/auth/callback`;
  const authUrl = provider === 'github'
    ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`
    : `https://bitbucket.org/site/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;

  window.location.href = authUrl;
};

export const handleAuthCallback = async (code, provider) => {
  return apiRequest('/auth/callback/', {
    method: 'POST',
    body: JSON.stringify({ code, provider }),
    includeAuth: false,
  });
};

export const logout = async () => {
  try {
    await apiRequest('/auth/logout/', {
      method: 'POST',
    });
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me/');
};

// ============================================
// Dashboard API
// ============================================

export const getDashboard = async () => {
  return apiRequest('/pull-requests/dashboard/');
};

export const getDashboardStats = async (timeRange = '7d') => {
  return apiRequest(`/analytics/stats/?range=${timeRange}`);
};

// ============================================
// Repository API
// ============================================

export const getRepos = async () => {
  // Mock data for demonstration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'frontend-app',
          fullName: 'company/frontend-app',
          provider: 'github',
          isActive: true,
          url: 'https://github.com/company/frontend-app',
          prsReviewed: 24,
          issuesFound: 12,
          lastSync: '2 hours ago',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'backend-api',
          fullName: 'company/backend-api',
          provider: 'bitbucket',
          isActive: true,
          url: 'https://bitbucket.org/company/backend-api',
          prsReviewed: 18,
          issuesFound: 8,
          lastSync: '5 hours ago',
          createdAt: '2024-01-10'
        },
        {
          id: 3,
          name: 'mobile-app',
          fullName: 'company/mobile-app',
          provider: 'github',
          isActive: false,
          url: 'https://github.com/company/mobile-app',
          prsReviewed: 0,
          issuesFound: 0,
          lastSync: 'Never',
          createdAt: '2024-02-01'
        }
      ]);
    }, 500);
  });
};

export const getAvailableRepos = async (provider = 'github') => {
  return apiRequest(`/repositories/available/?provider=${provider}`);
};

export const connectRepo = async (repoId) => {
  return apiRequest('/repositories/', {
    method: 'POST',
    body: JSON.stringify({ repo_id: repoId }),
  });
};

export const disconnectRepo = async (repoId) => {
  return apiRequest(`/repositories/${repoId}/`, {
    method: 'DELETE',
  });
};

export const syncRepo = async (repoId) => {
  return apiRequest(`/repositories/${repoId}/sync/`, {
    method: 'POST',
  });
};

// ============================================
// Pull Request API
// ============================================

export const getPullRequests = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/pull-requests/?${params}`);
};

export const getPullRequest = async (prId) => {
  return apiRequest(`/pull-requests/${prId}/`);
};

export const getPRReview = async (prId) => {
  return apiRequest(`/pull-requests/${prId}/review/`);
};

export const approvePR = async (prId) => {
  return apiRequest(`/pull-requests/${prId}/approve/`, {
    method: 'POST',
  });
};

export const requestChanges = async (prId, comments) => {
  return apiRequest(`/pull-requests/${prId}/request-changes/`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const triggerAnalysis = async (prId) => {
  return apiRequest(`/pull-requests/${prId}/analyze/`, {
    method: 'POST',
  });
};

// ============================================
// Analytics API
// ============================================

export const getAnalytics = async (timeRange = '30d') => {
  return apiRequest(`/analytics/?range=${timeRange}`);
};

export const getTeamMetrics = async () => {
  return apiRequest('/analytics/team/');
};

export const getRiskTrends = async (repoId = null) => {
  const params = repoId ? `?repo_id=${repoId}` : '';
  return apiRequest(`/analytics/risk-trends/${params}`);
};

// ============================================
// Settings API
// ============================================

export const getSettings = async () => {
  return apiRequest('/settings/');
};

export const updateSettings = async (settings) => {
  return apiRequest('/settings/', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
};

export const updateNotificationSettings = async (notifications) => {
  return apiRequest('/settings/notifications/', {
    method: 'PATCH',
    body: JSON.stringify(notifications),
  });
};

// ============================================
// Webhooks API
// ============================================

export const getWebhooks = async () => {
  return apiRequest('/webhooks/');
};

export const createWebhook = async (repoId, events) => {
  return apiRequest('/webhooks/', {
    method: 'POST',
    body: JSON.stringify({ repo_id: repoId, events }),
  });
};

export const deleteWebhook = async (webhookId) => {
  return apiRequest(`/webhooks/${webhookId}/`, {
    method: 'DELETE',
  });
};

// ============================================
// Export Reports API
// ============================================

export const exportReport = async (format = 'pdf', filters = {}) => {
  const params = new URLSearchParams({ format, ...filters }).toString();
  const url = `${API_BASE_URL}/reports/export/?${params}`;
  
  const token = getAuthToken();
  const response = await fetch(url, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  // Download file
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `pitcrew-report-${Date.now()}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

// ============================================
// File Upload API
// ============================================

export const uploadFile = async (file, type = 'avatar') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  return response.json();
};

// ============================================
// Error Handler for components
// ============================================

export const handleApiError = (error) => {
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  
  // Return user-friendly error message
  if (error.message.includes('Network')) {
    return 'Network error. Please check your connection.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'Something went wrong';
};

export default {
  // Auth
  login,
  logout,
  handleAuthCallback,
  getCurrentUser,
  
  // Dashboard
  getDashboard,
  getDashboardStats,
  
  // Repositories
  getRepos,
  getAvailableRepos,
  connectRepo,
  disconnectRepo,
  syncRepo,
  
  // Pull Requests
  getPullRequests,
  getPullRequest,
  getPRReview,
  approvePR,
  requestChanges,
  triggerAnalysis,
  
  // Analytics
  getAnalytics,
  getTeamMetrics,
  getRiskTrends,
  
  // Settings
  getSettings,
  updateSettings,
  updateNotificationSettings,
  
  // Webhooks
  getWebhooks,
  createWebhook,
  deleteWebhook,
  
  // Reports
  exportReport,
  
  // Upload
  uploadFile,
  
  // Error handling
  handleApiError,
};