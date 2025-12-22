import React, { useState, useEffect } from 'react';
import { BarChart3, GitPullRequest, AlertTriangle, CheckCircle2, TrendingUp, Clock, Shield, Zap } from 'lucide-react';

const PitCrewDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [prReview, setPrReview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading PR reviews
    setTimeout(() => {
      setPrReview([
        {
          id: 1,
          title: "Add user authentication module",
          repo: "frontend-app",
          author: "Sarah Chen",
          riskScore: 75,
          status: "reviewed",
          timestamp: "2 hours ago",
          issues: 3,
          suggestions: 5,
          linesChanged: 450
        },
        {
          id: 2,
          title: "Fix payment gateway integration",
          repo: "backend-api",
          author: "Mike Johnson",
          riskScore: 35,
          status: "reviewed",
          timestamp: "5 hours ago",
          issues: 1,
          suggestions: 2,
          linesChanged: 120
        },
        {
          id: 3,
          title: "Update database schema for orders",
          repo: "backend-api",
          author: "Emily Davis",
          riskScore: 85,
          status: "needs-attention",
          timestamp: "1 day ago",
          issues: 5,
          suggestions: 8,
          linesChanged: 680
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRiskColors = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskBadge = (score) => {
    if (score >= 70) return { label: 'High Risk', color: 'bg-red-500' };
    if (score >= 40) return { label: 'Medium Risk', color: 'bg-yellow-500' };
    return { label: 'Low Risk', color: 'bg-green-500' };
  };

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PitCrew AI
                </h1>
                <p className="text-sm text-gray-600">Intelligent Code Review</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Settings
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity">
                Connect Repo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={GitPullRequest}
            label="PRs Reviewed Today"
            value="24"
            trend="+12%"
            color="bg-blue-600"
          />
          <StatCard
            icon={Clock}
            label="Avg Review Time"
            value="3.2m"
            trend="-45%"
            color="bg-purple-600"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical Issues"
            value="7"
            color="bg-red-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Auto-Fixed"
            value="89%"
            trend="+5%"
            color="bg-green-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          {['overview', 'recent', 'high-risk'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* PR Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            prReview.map((pr) => {
              const riskBadge = getRiskBadge(pr.riskScore);
              return (
                <div
                  key={pr.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{pr.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskBadge.color} text-white`}>
                          {riskBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span className="font-medium text-gray-700">{pr.author}</span>
                        </span>
                        <span>•</span>
                        <span>{pr.repo}</span>
                        <span>•</span>
                        <span>{pr.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                        {pr.riskScore}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Risk Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-gray-700">{pr.issues} Issues</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-700">{pr.suggestions} Suggestions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{pr.linesChanged} Lines</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Review Progress</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                        Security
                      </span>
                      <span className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                        Performance
                      </span>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to review more PRs?</h3>
              <p className="text-blue-100 text-sm">Connect more repositories and let AI handle the heavy lifting.</p>
            </div>
            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Add Repository
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PitCrewDashboard;