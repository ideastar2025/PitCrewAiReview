// ============================================
// Login.jsx
// ============================================
import React, { useEffect, useState } from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getOAuthUrl,
  isAuthenticated,
  validateEnvironment,
} from "../utlis/auth";

// Feature component definition
const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [envCheck, setEnvCheck] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      navigate("/dashboard");
      return;
    }

    // Validate environment configuration
    const validation = validateEnvironment();
    setEnvCheck(validation);

    if (!validation.isValid) {
      console.error("Environment configuration errors:", validation.errors);
    }
  }, [navigate]);

  const handleGitHubLogin = () => {
    try {
      setError(null);
      const authUrl = getOAuthUrl("github");
      console.log("Redirecting to GitHub OAuth...");
      window.location.href = authUrl;
    } catch (err) {
      console.error("GitHub login error:", err);
      setError(err.message);
    }
  };

  const handleBitbucketLogin = () => {
    try {
      setError(null);
      const authUrl = getOAuthUrl("bitbucket");
      console.log("Redirecting to Bitbucket OAuth...");
      window.location.href = authUrl;
    } catch (err) {
      console.error("Bitbucket login error:", err);
      setError(err.message);
    }
  };

  // In your OAuth callback handler
const handleOAuthCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  
  
  // Exchange code for token
  const response = await fetch('/api/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  const data = await response.json();
  
  // ✅ Save the token
  localStorage.setItem('access_token', data.access_token);
  
  // Navigate to dashboard
  navigate('/dashboard');
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
            AI-powered code reviews that catch issues before they reach
            production. Integrate seamlessly with your workflow.
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
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                PitCrew AI
              </h1>
              <p className="text-gray-600">AI-Powered Code Review Assistant</p>
            </div>

            {/* Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGitHubLogin}
                disabled={envCheck && !envCheck.isValid}
                className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sign in with GitHub</span>
              </button>

              <button
                onClick={handleBitbucketLogin}
                disabled={envCheck && !envCheck.isValid}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
                </svg>
                <span>Sign in with Bitbucket</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to grant repository access for code
                review
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;