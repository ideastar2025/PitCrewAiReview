import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processCallback = async () => {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        // Extract OAuth parameters from URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('OAuth Callback - Params:', { code: !!code, state: !!state, error });

        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || error || 'OAuth authentication failed');
        }

        // Validate code
        if (!code) {
          throw new Error('No authorization code received from provider');
        }

        // Validate state (CSRF protection)
        const savedState = sessionStorage.getItem('oauth_state');
        if (state && savedState && state !== savedState) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        // Clear saved state
        sessionStorage.removeItem('oauth_state');

        // Determine provider
        const provider = sessionStorage.getItem('auth_provider') || 'github';
        console.log('Using provider:', provider);

        // Get API URL from environment
        const API_URL = import.meta.env?.VITE_API_URL || 
                       process.env.REACT_APP_API_URL || 
                       'http://localhost:8000';

        console.log('API URL:', API_URL);

        // Exchange code for token
        const response = await fetch(`${API_URL}/api/auth/${provider}/callback/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(
            errorData.error || 
            errorData.detail || 
            errorData.message ||
            `Authentication failed with status ${response.status}`
          );
        }

        const data = await response.json();
        console.log('Authentication successful');

        // Validate response
        if (!data.token) {
          throw new Error('No authentication token received from server');
        }

        if (!data.user) {
          throw new Error('No user data received from server');
        }

        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Stored token and user data');

        // Complete progress
        clearInterval(progressInterval);
        setProgress(100);
        setStatus('success');

        // Get redirect path
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');

        console.log('Redirecting to:', redirectPath);

        // Short delay for UX
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);

      } catch (err) {
        clearInterval(progressInterval);
        console.error('Authentication error:', err);
        setStatus('error');
        setError(err.message || 'An unexpected error occurred during authentication');
      }
    };

    processCallback();
  }, [navigate, location]);

  const handleRetry = () => {
    // Clear any stored data
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        
        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse">
                <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Authenticating</h2>
            <p className="text-gray-600 mb-6">Please wait while we complete your sign in...</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">{progress}% complete</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Success!</h2>
            <p className="text-gray-600 mb-4">You've been successfully authenticated</p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Failed</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error || 'An unexpected error occurred'}</p>
            </div>
            
            <button
              onClick={handleRetry}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Try Again
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              If the problem persists, please check:
            </p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li>• Your internet connection</li>
              <li>• Browser settings and cookies</li>
              <li>• Environment configuration</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;