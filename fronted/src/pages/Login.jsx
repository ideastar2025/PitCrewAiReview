// ============================================
// Login.jsx
// ============================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOAuthUrl, isAuthenticated, validateEnvironment } from '../utlis/auth';

const Login = () => {
  const navigate = useNavigate();
  const [envCheck, setEnvCheck] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      navigate('/dashboard');
      return;
    }

    // Validate environment configuration
    const validation = validateEnvironment();
    setEnvCheck(validation);

    if (!validation.isValid) {
      console.error('Environment configuration errors:', validation.errors);
    }
  }, [navigate]);

  const handleGitHubLogin = () => {
    try {
      setError(null);
      const authUrl = getOAuthUrl('github');
      console.log('Redirecting to GitHub OAuth...');
      window.location.href = authUrl;
    } catch (err) {
      console.error('GitHub login error:', err);
      setError(err.message);
    }
  };

  const handleBitbucketLogin = () => {
    try {
      setError(null);
      const authUrl = getOAuthUrl('bitbucket');
      console.log('Redirecting to Bitbucket OAuth...');
      window.location.href = authUrl;
    } catch (err) {
      console.error('Bitbucket login error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PitCrew AI</h1>
          <p className="text-gray-600">AI-Powered Code Review Assistant</p>
        </div>

        {/* Environment Check Warning */}
        {envCheck && !envCheck.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Configuration Error</h3>
                <ul className="text-xs text-red-700 space-y-1">
                  {envCheck.errors.map((err, idx) => (
                    <li key={idx}>• {err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Environment Config Display (for debugging) */}
        {envCheck && process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 text-xs">
            <p className="font-semibold text-gray-700 mb-2">Environment Config:</p>
            <div className="space-y-1 text-gray-600">
              {Object.entries(envCheck.config).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={value.includes('✓') ? 'text-green-600' : 'text-red-600'}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGitHubLogin}
            disabled={envCheck && !envCheck.isValid}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
            </svg>
            <span>Sign in with GitHub</span>
          </button>

          <button
            onClick={handleBitbucketLogin}
            disabled={envCheck && !envCheck.isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
            </svg>
            <span>Sign in with Bitbucket</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to grant repository access for code review
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


