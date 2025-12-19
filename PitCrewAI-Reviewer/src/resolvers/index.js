import Resolver from '@forge/resolver';
import React, { useState, useEffect } from 'react';
import { BarChart3, GitPullRequest, Shield, TrendingUp, AlertTriangle, CheckCircle2, Clock, Users, Github, Settings, LogOut, Menu, X, ChevronRight, Activity, Zap } from 'lucide-react';


const resolver = new Resolver();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [repos, setRepos] = useState([
    { id: 1, name: 'frontend-app', owner: 'company', connected: true, prs: 12 },
    { id: 2, name: 'backend-api', owner: 'company', connected: true, prs: 8 },
    { id: 3, name: 'mobile-app', owner: 'company', connected: false, prs: 0 }
  ]);
  
  const [reviews, setReviews] = useState([
    {
      id: 1,
      prNumber: 245,
      title: 'Add user authentication middleware',
      repo: 'backend-api',
      author: 'sarah.dev',
      riskScore: 85,
      status: 'approved',
      issues: 2,
      recommendations: 5,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      prNumber: 189,
      title: 'Refactor payment processing logic',
      repo: 'backend-api',
      author: 'mike.eng',
      riskScore: 45,
      status: 'needs-review',
      issues: 1,
      recommendations: 3,
      timestamp: '5 hours ago'
    },
    {
      id: 3,
      prNumber: 312,
      title: 'Update React components to TypeScript',
      repo: 'frontend-app',
      author: 'emma.ui',
      riskScore: 28,
      status: 'approved',
      issues: 0,
      recommendations: 2,
      timestamp: '1 day ago'
    }
  ]);

  const [selectedReview, setSelectedReview] = useState(null);

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskBadge = (score) => {
    if (score >= 70) return { text: 'High Risk', color: 'bg-red-500' };
    if (score >= 40) return { text: 'Medium Risk', color: 'bg-yellow-500' };
    return { text: 'Low Risk', color: 'bg-green-500' };
  };

  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50 shadow-2xl`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">PitCrew AI</h1>
              <p className="text-xs text-slate-400">Code Reviewer</p>
            </div>
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
          { id: 'reviews', icon: GitPullRequest, label: 'PR Reviews' },
          { id: 'repos', icon: Github, label: 'Repositories' },
          { id: 'analytics', icon: Activity, label: 'Analytics' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === item.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
          <Settings className="w-5 h-5" />
          {sidebarOpen && <span>Settings</span>}
        </button>
      </div>
    </div>
  );


resolver.define('getText', (req) => {
  console.log(req);
    const DashboardPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-1">Monitor your team's code review metrics</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium">
          <Zap className="w-5 h-5" />
          Run Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active PRs', value: '12', icon: GitPullRequest, color: 'from-blue-500 to-cyan-500', change: '+3' },
          { label: 'Avg Risk Score', value: '42', icon: Shield, color: 'from-purple-500 to-pink-500', change: '-8' },
          { label: 'Reviews Today', value: '8', icon: CheckCircle2, color: 'from-green-500 to-emerald-500', change: '+2' },
          { label: 'High Risk', value: '2', icon: AlertTriangle, color: 'from-red-500 to-orange-500', change: '-1' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Recent PR Reviews</h3>
          <div className="space-y-3">
            {reviews.slice(0, 3).map(review => (
              <div key={review.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer" onClick={() => { setSelectedReview(review); setCurrentPage('reviews'); }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-slate-600">#{review.prNumber}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getRiskColor(review.riskScore)}`}>
                        {getRiskBadge(review.riskScore).text}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 mb-1">{review.title}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Github className="w-4 h-4" />
                        {review.repo}
                      </span>
                      <span>by {review.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {review.timestamp}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Team Activity</h3>
          <div className="space-y-4">
            {[
              { user: 'sarah.dev', action: 'approved PR #245', time: '2h ago', color: 'bg-green-100 text-green-600' },
              { user: 'mike.eng', action: 'opened PR #189', time: '5h ago', color: 'bg-blue-100 text-blue-600' },
              { user: 'emma.ui', action: 'merged PR #312', time: '1d ago', color: 'bg-purple-100 text-purple-600' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center font-bold text-sm`}>
                  {activity.user[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                  <p className="text-xs text-slate-600">{activity.action}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewsPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">PR Reviews</h2>
          <p className="text-slate-600 mt-1">AI-powered code review insights</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Repositories</option>
            <option>backend-api</option>
            <option>frontend-app</option>
          </select>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Status</option>
            <option>Needs Review</option>
            <option>Approved</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-mono font-bold text-slate-900">#{review.prNumber}</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${getRiskColor(review.riskScore)}`}>
                    Risk: {review.riskScore}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    review.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.status === 'approved' ? '✓ Approved' : '⏳ Needs Review'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{review.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Github className="w-4 h-4" />
                    {review.repo}
                  </span>
                  <span>by {review.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {review.timestamp}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{review.issues}</p>
                  <p className="text-xs text-slate-600">Issues Found</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{review.recommendations}</p>
                  <p className="text-xs text-slate-600">Recommendations</p>
                </div>
              </div>
              <div className="flex justify-end items-center">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReposPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Repositories</h2>
          <p className="text-slate-600 mt-1">Manage connected repositories</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium">
          <Github className="w-5 h-5" />
          Connect Repository
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map(repo => (
          <div key={repo.id} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{repo.name}</h3>
                  <p className="text-sm text-slate-600">{repo.owner}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                repo.connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {repo.connected ? '● Connected' : '○ Not Connected'}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Active PRs</span>
                <span className="font-bold text-slate-900">{repo.prs}</span>
              </div>
            </div>
            <button className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all ${
              repo.connected
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
            }`}>
              {repo.connected ? 'Manage' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const AnalyticsPage = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Analytics</h2>
        <p className="text-slate-600 mt-1">Team performance and code quality metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Risk Score Trend</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {[65, 58, 52, 48, 45, 42, 38].map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${value}%` }}></div>
                <span className="text-xs text-slate-600">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Top Contributors</h3>
          <div className="space-y-4">
            {[
              { name: 'sarah.dev', reviews: 24, score: 92 },
              { name: 'mike.eng', reviews: 18, score: 88 },
              { name: 'emma.ui', reviews: 15, score: 85 }
            ].map((contributor, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{contributor.name}</p>
                    <p className="text-sm text-slate-600">{contributor.reviews} reviews</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{contributor.score}</p>
                  <p className="text-xs text-slate-600">Quality Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'reviews' && <ReviewsPage />}
          {currentPage === 'repos' && <ReposPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
        </div>
      </div>
    </div>
  );
});

export const handler = resolver.getDefinitions();
