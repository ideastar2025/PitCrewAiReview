import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Download
} from 'lucide-react';
import RiskScoreCard from './RiskScoreCard';
import PRPanel, { PRPanelCompact } from './PRPanel';
import LoadingSpinner, { CardSkeleton, AnalysisLoader } from './LoadingSpinner';
import { ErrorMessage, EmptyState } from './ErrorBoundary';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, high-risk, medium-risk, low-risk
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [analyzing, setAnalyzing] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPRs: 0,
      avgReviewTime: '0m',
      criticalIssues: 0,
      autoFixed: '0%'
    },
    recentPRs: []
  });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = {
        stats: {
          totalPRs: 24,
          avgReviewTime: '3.2m',
          criticalIssues: 7,
          autoFixed: '89%',
          avgRiskScore: 52,
          previousAvgRiskScore: 61
        },
        recentPRs: [
          {
            id: 1,
            title: "Add user authentication module",
            repo: "frontend-app",
            author: "Sarah Chen",
            riskScore: 75,
            status: "open",
            timestamp: "2 hours ago",
            issues: 3,
            suggestions: 5,
            linesChanged: 450,
            filesChanged: 12,
            description: "Implementing JWT-based authentication with OAuth integration",
            branch: { source: "feature/auth", target: "main" }
          },
          {
            id: 2,
            title: "Fix payment gateway integration",
            repo: "backend-api",
            author: "Mike Johnson",
            riskScore: 35,
            status: "open",
            timestamp: "5 hours ago",
            issues: 1,
            suggestions: 2,
            linesChanged: 120,
            filesChanged: 3,
            description: "Resolving webhook timeout issues",
            branch: { source: "fix/payment-webhooks", target: "develop" }
          },
          {
            id: 3,
            title: "Update database schema for orders",
            repo: "backend-api",
            author: "Emily Davis",
            riskScore: 85,
            status: "open",
            timestamp: "1 day ago",
            issues: 5,
            suggestions: 8,
            linesChanged: 680,
            filesChanged: 8,
            description: "Major schema refactor to support new order types",
            branch: { source: "feature/order-types", target: "main" }
          },
          {
            id: 4,
            title: "Optimize API response caching",
            repo: "backend-api",
            author: "Alex Kim",
            riskScore: 25,
            status: "merged",
            timestamp: "2 days ago",
            issues: 0,
            suggestions: 3,
            linesChanged: 85,
            filesChanged: 2,
            description: "Implementing Redis caching layer",
            branch: { source: "perf/api-cache", target: "main" }
          },
          {
            id: 5,
            title: "Add dark mode support",
            repo: "frontend-app",
            author: "Jordan Lee",
            riskScore: 45,
            status: "open",
            timestamp: "3 days ago",
            issues: 2,
            suggestions: 4,
            linesChanged: 320,
            filesChanged: 15,
            description: "Theme switching with system preference detection",
            branch: { source: "feature/dark-mode", target: "develop" }
          }
        ]
      };

      setDashboardData(mockData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (prId) => {
    console.log('View PR details:', prId);
    // Navigate to PR details page
  };

  const handleApprove = (prId) => {
    console.log('Approve PR:', prId);
    // Call approve API
  };

  const handleReject = (prId) => {
    console.log('Request changes for PR:', prId);
    // Call request changes API
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setAnalyzing(false);
    fetchDashboardData();
  };

  // Filter PRs based on search and filter
  const filteredPRs = dashboardData.recentPRs.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pr.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pr.repo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'high-risk') return pr.riskScore >= 70;
    if (filterStatus === 'medium-risk') return pr.riskScore >= 40 && pr.riskScore < 70;
    if (filterStatus === 'low-risk') return pr.riskScore < 40;
    
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ErrorMessage 
          error={error} 
          onRetry={fetchDashboardData}
          type="error"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your pull request reviews and code quality</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={GitPullRequest}
          label="PRs Reviewed Today"
          value={dashboardData.stats.totalPRs}
          color="bg-blue-600"
        />
        <StatCard
          icon={Clock}
          label="Avg Review Time"
          value={dashboardData.stats.avgReviewTime}
          trend="-45%"
          color="bg-purple-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Issues"
          value={dashboardData.stats.criticalIssues}
          color="bg-red-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Auto-Fixed"
          value={dashboardData.stats.autoFixed}
          trend="+5%"
          color="bg-green-600"
        />
      </div>

      {/* Risk Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <RiskScoreCard
            score={dashboardData.stats.avgRiskScore}
            previousScore={dashboardData.stats.previousAvgRiskScore}
            title="Average Risk Score"
            showTrend={true}
            size="large"
          />
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Analyze All PRs</span>
                </>
              )}
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Connect Repo</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search PRs, authors, or repos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <FilterButton
              active={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
            >
              All
            </FilterButton>
            <FilterButton
              active={filterStatus === 'high-risk'}
              onClick={() => setFilterStatus('high-risk')}
              variant="red"
            >
              High Risk
            </FilterButton>
            <FilterButton
              active={filterStatus === 'medium-risk'}
              onClick={() => setFilterStatus('medium-risk')}
              variant="yellow"
            >
              Medium
            </FilterButton>
            <FilterButton
              active={filterStatus === 'low-risk'}
              onClick={() => setFilterStatus('low-risk')}
              variant="green"
            >
              Low Risk
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Analysis Loader */}
      {analyzing && (
        <div className="mb-6">
          <AnalysisLoader stage="analyzing" />
        </div>
      )}

      {/* PR List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Pull Requests ({filteredPRs.length})
          </h2>
        </div>

        {filteredPRs.length === 0 ? (
          <EmptyState
            icon={GitPullRequest}
            title="No pull requests found"
            description={searchQuery ? "Try adjusting your search or filters" : "Connect a repository to start reviewing PRs"}
            action={
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
                Connect Repository
              </button>
            }
          />
        ) : (
          <div className={viewMode === 'grid' ? 'space-y-4' : 'space-y-3'}>
            {filteredPRs.map((pr) => (
              viewMode === 'grid' ? (
                <PRPanel
                  key={pr.id}
                  pr={pr}
                  onViewDetails={handleViewDetails}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ) : (
                <PRPanelCompact
                  key={pr.id}
                  pr={pr}
                  onViewDetails={handleViewDetails}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
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

// Filter Button Component
const FilterButton = ({ children, active, onClick, variant = 'default' }) => {
  const variants = {
    default: active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300',
    red: active ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border-gray-300',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border-gray-300',
    green: active ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border-gray-300'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export default Dashboard;