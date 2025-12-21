import React from 'react';
import { AlertTriangle, RefreshCw, Home, AlertCircle, XCircle } from 'lucide-react';

// Main Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error reporting service (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset
        });
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                </div>
                <p className="text-red-100">
                  We encountered an unexpected error. Don't worry, we're on it!
                </p>
              </div>

              {/* Error Details */}
              <div className="p-6">
                {this.state.error && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Error Details
                    </h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-mono text-red-800 break-all">
                        {this.state.error.toString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error count warning */}
                {this.state.errorCount > 2 && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">
                          Multiple errors detected
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This error has occurred {this.state.errorCount} times. Consider refreshing the page.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={this.handleReset}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Again</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={this.handleReload}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reload Page</span>
                    </button>

                    <button
                      onClick={this.handleGoHome}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      <span>Go Home</span>
                    </button>
                  </div>
                </div>

                {/* Support info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Need help?
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    If this problem persists, please contact our support team with the error details above.
                  </p>
                  <a
                    href="mailto:support@pitcrewai.com"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Contact Support →
                  </a>
                </div>

                {/* Stack trace (development only) */}
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      View Stack Trace (Development)
                    </summary>
                    <div className="mt-2 bg-gray-900 rounded-lg p-4 overflow-auto">
                      <pre className="text-xs text-green-400 font-mono">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error message component (for displaying errors without full boundary)
export const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss,
  type = 'error' // 'error', 'warning', 'info'
}) => {
  const typeConfig = {
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.text} mb-1`}>
            {error?.title || 'An error occurred'}
          </h3>
          <p className={`text-sm ${config.text} opacity-90`}>
            {error?.message || error?.toString() || 'Something went wrong. Please try again.'}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="flex items-center space-x-2 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`px-4 py-2 ${config.buttonBg} text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty state component (for when there's no data)
export const EmptyState = ({ 
  icon: Icon = AlertCircle,
  title = "No data available",
  description = "There's nothing to display here yet.",
  action = null
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

// Network error component
export const NetworkError = ({ onRetry }) => {
  return (
    <ErrorMessage
      error={{
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.'
      }}
      onRetry={onRetry}
      type="warning"
    />
  );
};

// Not found component
export const NotFound = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={onGoHome || (() => window.location.href = '/')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity inline-flex items-center space-x-2"
        >
          <Home className="w-5 h-5" />
          <span>Go to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;