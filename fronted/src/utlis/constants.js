// ============================================
// constants.js - Application Constants
// ============================================

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

// OAuth Configuration
export const OAUTH_PROVIDERS = {
  GITHUB: 'github',
  BITBUCKET: 'bitbucket',
};

export const OAUTH_CLIENT_IDS = {
  github: process.env.REACT_APP_GITHUB_CLIENT_ID,
  bitbucket: process.env.REACT_APP_BITBUCKET_CLIENT_ID,
};

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const RISK_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
  LOW: 0,
};

// PR Status
export const PR_STATUS = {
  OPEN: 'open',
  MERGED: 'merged',
  CLOSED: 'closed',
  DRAFT: 'draft',
};

// Issue Severity
export const ISSUE_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  PR_CREATED: 'pr_created',
  PR_MERGED: 'pr_merged',
  PR_CLOSED: 'pr_closed',
  HIGH_RISK: 'high_risk',
  ISSUE_FOUND: 'issue_found',
  WEEKLY_REPORT: 'weekly_report',
};

// Time Ranges
export const TIME_RANGES = {
  TODAY: '1d',
  WEEK: '7d',
  MONTH: '30d',
  QUARTER: '90d',
  YEAR: '365d',
};

// Pagination
export const PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  AUTH_PROVIDER: 'auth_provider',
  REDIRECT_PATH: 'redirect_after_login',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  REPOS: '/repositories',
  PULL_REQUESTS: '/pull-requests',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  HELP: '/help',
};

// Color Schemes
export const COLORS = {
  PRIMARY: '#2563eb', // blue-600
  SECONDARY: '#9333ea', // purple-600
  SUCCESS: '#10b981', // green-600
  WARNING: '#f59e0b', // yellow-600
  DANGER: '#ef4444', // red-600
  INFO: '#3b82f6', // blue-500
};

// Animation Durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Debounce Delays (ms)
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  TYPING: 500,
  RESIZE: 200,
};

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'text/plain', 'text/markdown'],
};

// ============================================
// formatters.js - Data Formatting Utilities
// ============================================

// Date Formatting
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const formats = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    full: { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
  };
  
  return new Intl.DateTimeFormat('en-US', formats[format] || formats.short).format(d);
};

// Relative Time Formatting
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Number Formatting
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  return `${formatNumber(value, decimals)}%`;
};

// File Size Formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// Duration Formatting
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

// Currency Formatting
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Text Formatting
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelToTitle = (str) => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// Risk Level Formatting
export const getRiskLevel = (score) => {
  if (score >= RISK_THRESHOLDS.HIGH) return RISK_LEVELS.HIGH;
  if (score >= RISK_THRESHOLDS.MEDIUM) return RISK_LEVELS.MEDIUM;
  return RISK_LEVELS.LOW;
};

export const getRiskColor = (score) => {
  const level = getRiskLevel(score);
  const colors = {
    [RISK_LEVELS.HIGH]: 'red',
    [RISK_LEVELS.MEDIUM]: 'yellow',
    [RISK_LEVELS.LOW]: 'green',
  };
  return colors[level];
};

export const getRiskLabel = (score) => {
  const level = getRiskLevel(score);
  const labels = {
    [RISK_LEVELS.HIGH]: 'High Risk',
    [RISK_LEVELS.MEDIUM]: 'Medium Risk',
    [RISK_LEVELS.LOW]: 'Low Risk',
  };
  return labels[level];
};

// Code Formatting
export const formatLineCount = (count) => {
  if (!count) return '0 lines';
  if (count === 1) return '1 line';
  return `${formatCompactNumber(count)} lines`;
};

export const formatCommitHash = (hash) => {
  if (!hash) return 'N/A';
  return hash.substring(0, 7);
};

// Status Formatting
export const formatPRStatus = (status) => {
  const statuses = {
    [PR_STATUS.OPEN]: 'Open',
    [PR_STATUS.MERGED]: 'Merged',
    [PR_STATUS.CLOSED]: 'Closed',
    [PR_STATUS.DRAFT]: 'Draft',
  };
  return statuses[status] || status;
};

export const formatSeverity = (severity) => {
  const severities = {
    [ISSUE_SEVERITY.CRITICAL]: 'Critical',
    [ISSUE_SEVERITY.HIGH]: 'High',
    [ISSUE_SEVERITY.MEDIUM]: 'Medium',
    [ISSUE_SEVERITY.LOW]: 'Low',
  };
  return severities[severity] || severity;
};

// Array Formatting
export const formatList = (items, maxItems = 3) => {
  if (!items || items.length === 0) return 'None';
  
  if (items.length <= maxItems) {
    return items.join(', ');
  }
  
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  return `${visible.join(', ')} and ${remaining} more`;
};

// URL Formatting
export const formatRepoUrl = (provider, fullName) => {
  const baseUrls = {
    github: 'https://github.com',
    bitbucket: 'https://bitbucket.org',
  };
  
  const baseUrl = baseUrls[provider];
  if (!baseUrl) return '#';
  
  return `${baseUrl}/${fullName}`;
};

export const formatPRUrl = (provider, fullName, prNumber) => {
  const repoUrl = formatRepoUrl(provider, fullName);
  const path = provider === 'github' ? 'pull' : 'pull-requests';
  return `${repoUrl}/${path}/${prNumber}`;
};

// Validation Helpers
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default {
  // Dates
  formatDate,
  formatRelativeTime,
  
  // Numbers
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatCurrency,
  
  // Text
  truncateText,
  capitalize,
  camelToTitle,
  slugify,
  
  // Risk
  getRiskLevel,
  getRiskColor,
  getRiskLabel,
  
  // Code
  formatLineCount,
  formatCommitHash,
  
  // Status
  formatPRStatus,
  formatSeverity,
  
  // Arrays
  formatList,
  
  // URLs
  formatRepoUrl,
  formatPRUrl,
  
  // Validation
  isValidEmail,
  isValidUrl,
};