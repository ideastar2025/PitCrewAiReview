import React, { useState, useEffect } from 'react';
import { GitPullRequest, AlertTriangle, CheckCircle2, XCircle, Clock, Shield, TrendingUp, FileCode, Zap } from 'lucide-react';

const JiraPRPanel = () => {
  const [prData, setPrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching PR data
    setTimeout(() => {
      setPrData({
        prTitle: "Add user authentication module",
        prNumber: 247,
        repo: "frontend-app",
        author: "Sarah Chen",
        status: "open",
        riskScore: 75,
        timestamp: "2 hours ago",
        summary: "This PR introduces a comprehensive authentication system with JWT tokens, OAuth integration, and role-based access control. The implementation includes proper error handling and security best practices.",
        deploymentReady: false,
        metrics: {
          linesAdded: 450,
          linesRemoved: 120,
          filesChanged: 12,
          complexity: "Medium-High"
        },
        issues: [
          {
            severity: "high",
            title: "Potential SQL injection vulnerability",
            line: 156,
            file: "auth/login.js",
            suggestion: "Use parameterized queries instead of string concatenation"
          },
          {
            severity: "medium",
            title: "Missing error handling in OAuth callback",
            line: 89,
            file: "oauth/callback.js",
            suggestion: "Add try-catch block to handle potential token validation errors"
          },
          {
            severity: "low",
            title: "Unused import statement",
            line: 5,
            file: "auth/validator.js",
            suggestion: "Remove unused import 'lodash/merge'"
          }
        ],
        recommendations: [
          "Add unit tests for authentication edge cases",
          "Consider implementing rate limiting for login attempts",
          "Add logging for security events",
          "Update API documentation with new auth endpoints"
        ],
        blockers: [
          "SQL injection vulnerability must be fixed before merge",
          "Missing integration tests for OAuth flow"
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      high: <XCircle className="w-4 h-4" />,
      medium: <AlertTriangle className="w-4 h-4" />,
      low: <AlertTriangle className="w-4 h-4" />
    };
    return icons[severity] || icons.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!prData) {
    return (
      <div className="p-6 text-center text-gray-500">
        <GitPullRequest className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No PR associated with this issue</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Code Review</h2>
              <p className="text-blue-100 text-sm">Powered by PitCrew AI</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{prData.riskScore}</div>
            <div className="text-xs text-blue-100">Risk Score</div>
          </div>
        </div>

        {/* PR Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <GitPullRequest className="w-5 h-5" />
            <span className="font-semibold">PR #{prData.prNumber}</span>
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs">Open</span>
          </div>
          <h3 className="text-lg font-medium mb-2">{prData.prTitle}</h3>
          <div className="flex items-center space-x-4 text-sm text-blue-100">
            <span>{prData.author}</span>
            <span>•</span>
            <span>{prData.repo}</span>
            <span>•</span>
            <span>{prData.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Deployment Status */}
        <div className={`rounded-lg p-4 border-2 ${
          prData.deploymentReady 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            {prData.deploymentReady ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className={`font-semibold ${
                prData.deploymentReady ? 'text-green-900' : 'text-red-900'
              }`}>
                {prData.deploymentReady ? 'Ready for Deployment' : 'Not Ready for Deployment'}
              </h3>
              <p className={`text-sm ${
                prData.deploymentReady ? 'text-green-700' : 'text-red-700'
              }`}>
                {prData.deploymentReady 
                  ? 'All checks passed. Safe to merge.' 
                  : `${prData.blockers.length} blocker(s) must be resolved`}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Files Changed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{prData.metrics.filesChanged}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Lines Added</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{prData.metrics.linesAdded}</div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Summary</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{prData.summary}</p>
        </div>

        {/* Blockers */}
        {prData.blockers.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-center space-x-2 mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Blockers ({prData.blockers.length})</h3>
            </div>
            <ul className="space-y-2">
              {prData.blockers.map((blocker, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm text-red-800">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>{blocker}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Issues */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Issues Found ({prData.issues.length})</h3>
            </div>
          </div>
          <div className="space-y-3">
            {prData.issues.map((issue, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded border ${getSeverityColor(issue.severity)}`}>
                    {getSeverityIcon(issue.severity)}
                    <span className="text-xs font-medium uppercase">{issue.severity}</span>
                  </div>
                  <span className="text-xs text-gray-500">Line {issue.line}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1 text-sm">{issue.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{issue.file}</p>
                <div className="bg-blue-50 rounded p-2 border border-blue-200">
                  <p className="text-xs text-blue-900">💡 {issue.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {prData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
            View Full PR
          </button>
          <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Re-analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default JiraPRPanel;