import React, { useState } from 'react';
import { 
  GitPullRequest, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  GitBranch,
  MessageSquare,
  FileCode,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
// import RiskScoreCard from './RiskScoreCard';

const PRPanel = ({ pr, onViewDetails, className = '' }) => {
  const [expand, setExpand] = useState(false);

  // Default PR structure if not provided
  const defaultPR = {
    id: 1,
    number: 247,
    title: 'Add user authentication module',
    description: 'Implements JWT-based authentication with OAuth support',
    author: 'Sarah Chen',
    authorAvatar: null,
    repo: 'frontend-app',
    riskScore: 75,
    status: 'open',
    timestamp: '2 hours ago',
    sourceBranch: 'feature/auth-module',
    targetBranch: 'main',
    issues: [
      { severity: 'high', title: 'Potential SQL injection vulnerability', count: 1 },
      { severity: 'medium', title: 'Missing error handling', count: 2 },
      { severity: 'low', title: 'Code style issues', count: 3 }
    ],
    metrics: {
      filesChanged: 12,
      linesAdded: 450,
      linesRemoved: 120,
      comments: 8
    },
    reviewers: ['Mike Johnson', 'Emily Davis'],
    labels: ['security', 'authentication', 'high-priority']
  };

  const prData = { ...defaultPR, ...pr };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800 border-green-200',
      merged: 'bg-purple-100 text-purple-800 border-purple-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || colors.open;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'high') return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (severity === 'medium') return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-blue-600" />;
  };

  const totalIssues = prData.issues.reduce((sum, issue) => sum + issue.count, 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <GitPullRequest className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">
                #{prData.number}
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(prData.status)}`}>
                {prData.status}
              </span>
              {prData.labels.slice(0, 2).map((label, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                >
                  {label}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
              {prData.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {prData.description}
            </p>
          </div>

          {/* Risk Score Preview */}
          <div className="ml-4">
            <RiskScoreCard 
              score={prData.riskScore} 
              size="small"
              issues={prData.issues}
            />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{prData.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{prData.timestamp}</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span className="font-mono text-xs">
              {prData.sourceBranch} → {prData.targetBranch}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <FileCode className="w-4 h-4 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{prData.metrics.filesChanged}</span>
          </div>
          <p className="text-xs text-gray-600">Files</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-2xl font-bold text-green-600">+{prData.metrics.linesAdded}</span>
          </div>
          <p className="text-xs text-gray-600">Added</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />
            <span className="text-2xl font-bold text-red-600">-{prData.metrics.linesRemoved}</span>
          </div>
          <p className="text-xs text-gray-600">Removed</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{prData.metrics.comments}</span>
          </div>
          <p className="text-xs text-gray-600">Comments</p>
        </div>
      </div>

      {/* Issues Summary */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>AI Analysis Results</span>
          </h4>
          <span className="text-xs text-gray-500">{totalIssues} issues found</span>
        </div>
        
        <div className="space-y-2">
          {prData.issues.map((issue, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getSeverityIcon(issue.severity)}
                <span className="text-sm text-gray-700">{issue.title}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {issue.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Details */}
      {expand && (
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          {/* Reviewers */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Reviewers</h5>
            <div className="flex flex-wrap gap-2">
              {prData.reviewers.map((reviewer, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {reviewer.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">{reviewer}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>

          {/* All Labels */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Labels</h5>
            <div className="flex flex-wrap gap-2">
              {prData.labels.map((label, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Show More</span>
            </>
          )}
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails && onViewDetails(prData)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>View Details</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity">
            Review Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default PRPanel;