import React, { useState } from 'react';
import { Shield, Github, GitBranch, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hook/userAuth';
import { InlineLoader } from '../components/LoadingSpinner';

const Login = () => {
  const { login, error: authError } = useAuth();
  const [loading, setLoading] = useState(null); // 'github' or 'bitbucket'
  const [error, setError] = useState(null);

  const handleGithubLogin = async () => {
    setLoading('github');
    setError(null);
    
    try {
      await login('github');
    } catch (err) {
      setError('Failed to connect to GitHub. Please try again.');
      console.error('GitHub login error:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleBitbucketLogin = async () => {
    setLoading('bitbucket');
    setError(null);
    
    try {
      await login('bitbucket');
    } catch (err) {
      setError('Failed to connect to Bitbucket. Please try again.');
      console.error('Bitbucket login error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center justify-center lg:justify-start space-x-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PitCrew AI
              </h1>
              <p className="text-gray-600 text-lg">Intelligent Code Review</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ship Faster, Ship Safer
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            AI-powered code reviews that catch issues before they reach production.
            Integrate seamlessly with your workflow.
          </p>

          {/* Features */}
          <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            <Feature
              icon={CheckCircle2}
              title="Instant Analysis"
              description="AI reviews every PR in seconds, not hours"
            />
            <Feature
              icon={CheckCircle2}
              title="Security First"
              description="Catch vulnerabilities before they become problems"
            />
            <Feature
              icon={CheckCircle2}
              title="Seamless Integration"
              description="Works directly in Jira and Bitbucket"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h3>
              <p className="text-gray-600">
                Connect your repository to get started
              </p>
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">Authentication Error</p>
                  <p className="text-sm text-red-700 mt-1">{error || authError}</p>
                </div>
              </div>
            )}

            {/* Login Buttons */}
            <div className="space-y-4">
              {/* GitHub Login */}
              <button
                onClick={handleGithubLogin}
                disabled={loading !== null}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'github' ? (
                  <>
                    <InlineLoader size="sm" className="text-white" />
                    <span>Connecting to GitHub...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5" />
                    <span>Continue with GitHub</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Bitbucket Login */}
              <button
                onClick={handleBitbucketLogin}
                disabled={loading !== null}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'bitbucket' ? (
                  <>
                    <InlineLoader size="sm" className="text-white" />
                    <span>Connecting to Bitbucket...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-5 h-5" />
                    <span>Continue with Bitbucket</span>
                  </>
                )}
              </button>
            </div>

            {/* Terms */}
            <p className="mt-6 text-xs text-center text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </p>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secured with OAuth 2.0</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature component
const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
      <Icon className="w-4 h-4 text-green-600" />
    </div>
    <div className="text-left">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export default Login;