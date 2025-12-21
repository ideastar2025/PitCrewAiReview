import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  GitBranch, 
  Shield, 
  CheckCircle2,
  XCircle,
  Settings,
  Trash2,
  RefreshCw,
  ExternalLink,
  Github,
  AlertCircle
} from 'lucide-react';
import { getRepos, connectRepo, disconnectRepo, syncRepo } from '../utlis/api';
// import LoadingSpinner, { CardSkeleton } from '../components/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../components/ErrorBoundary';
import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Repos = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getRepos();
      setRepos(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (repoId) => {
    try {
      await connectRepo(repoId);
      fetchRepos();
    } catch (err) {
      console.error('Connect error:', err);
    }
  };

  const handleDisconnect = async (repoId) => {
    if (window.confirm('Are you sure you want to disconnect this repository?')) {
      try {
        await disconnectRepo(repoId);
        fetchRepos();
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    }
  };

  const handleSync = async (repoId) => {
    try {
      await syncRepo(repoId);
      fetchRepos();
    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigate = (page) => {
    setSidebarOpen(false);
    // Navigation logic handled by parent or router
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'active') return repo.isActive;
    if (filter === 'inactive') return !repo.isActive;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          currentPage="repositories"
          onNavigate={handleNavigate}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {loading ? (
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="max-w-7xl mx-auto px-6 py-8">
              <ErrorMessage error={error} onRetry={fetchRepos} />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Repositories</h1>
                  <p className="text-gray-600">Manage your connected repositories and review PRs</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Repository</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  icon={FolderGit2}
                  label="Total Repositories"
                  value={repos.length}
                  color="bg-blue-600"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Active"
                  value={repos.filter(r => r.isActive).length}
                  color="bg-green-600"
                />
                <StatCard
                  icon={GitBranch}
                  label="Providers"
                  value={new Set(repos.map(r => r.provider)).size}
                  color="bg-purple-600"
                />
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <FilterButton
                      active={filter === 'all'}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </FilterButton>
                    <FilterButton
                      active={filter === 'active'}
                      onClick={() => setFilter('active')}
                    >
                      Active
                    </FilterButton>
                    <FilterButton
                      active={filter === 'inactive'}
                      onClick={() => setFilter('inactive')}
                    >
                      Inactive
                    </FilterButton>
                  </div>
                </div>
              </div>

              {/* Repository Grid */}
              {filteredRepos.length === 0 ? (
                <EmptyState
                  icon={FolderGit2}
                  title="No repositories found"
                  description={searchQuery ? "Try adjusting your search" : "Connect a repository to start reviewing PRs"}
                  action={
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Add Repository
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRepos.map((repo) => (
                    <RepoCard
                      key={repo.id}
                      repo={repo}
                      onSync={handleSync}
                      onDisconnect={handleDisconnect}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Repository Modal */}
      {showAddModal && (
        <AddRepoModal
          onClose={() => setShowAddModal(false)}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
};

// Repository Card Component
const RepoCard = ({ repo, onSync, onDisconnect }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await onSync(repo.id);
    setSyncing(false);
  };

  const getProviderIcon = (provider) => {
    if (provider === 'github') {
      return <Github className="w-5 h-5 text-white" />;
    }
    return <GitBranch className="w-5 h-5 text-white" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              repo.provider === 'github' ? 'bg-gray-900' : 'bg-blue-600'
            }`}>
              {getProviderIcon(repo.provider)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{repo.name}</h3>
              <p className="text-sm text-gray-600 truncate">{repo.fullName}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            repo.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {repo.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-900 font-medium mb-1">PRs Reviewed</p>
            <p className="text-2xl font-bold text-blue-600">{repo.prsReviewed || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <p className="text-xs text-purple-900 font-medium mb-1">Issues Found</p>
            <p className="text-2xl font-bold text-purple-600">{repo.issuesFound || 0}</p>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
          <RefreshCw className="w-3 h-3" />
          <span>Last synced: {repo.lastSync || 'Never'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Sync repository"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Open repository"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <button
          onClick={() => onDisconnect(repo.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Disconnect repository"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Add Repository Modal
const AddRepoModal = ({ onClose, onConnect }) => {
  const [availableRepos, setAvailableRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAvailableRepos();
  }, []);

  const fetchAvailableRepos = async () => {
    // Mock data - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAvailableRepos([
      { id: 1, name: 'backend-api', fullName: 'company/backend-api', provider: 'github' },
      { id: 2, name: 'frontend-web', fullName: 'company/frontend-web', provider: 'github' },
      { id: 3, name: 'mobile-app', fullName: 'company/mobile-app', provider: 'bitbucket' },
      { id: 4, name: 'data-pipeline', fullName: 'company/data-pipeline', provider: 'github' },
      { id: 5, name: 'analytics-dashboard', fullName: 'company/analytics-dashboard', provider: 'bitbucket' },
    ]);
    setLoading(false);
  };

  const filteredRepos = availableRepos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Repository</h2>
          <p className="text-gray-600">Select a repository to start reviewing PRs with AI</p>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Repository List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Loading repositories..." />
            </div>
          ) : filteredRepos.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No repositories found"
              description="Try adjusting your search or connect your GitHub/Bitbucket account"
            />
          ) : (
            <div className="space-y-2">
              {filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => {
                    onConnect(repo.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      repo.provider === 'github' ? 'bg-gray-900' : 'bg-blue-600'
                    }`}>
                      {repo.provider === 'github' ? (
                        <Github className="w-5 h-5 text-white" />
                      ) : (
                        <GitBranch className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{repo.name}</p>
                      <p className="text-sm text-gray-600">{repo.fullName}</p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-3 mb-2">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
  </div>
);

// Filter Button
const FilterButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
      active
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

export default Repos;