import React from 'react';
import { Loader2, Shield, Zap, GitPullRequest } from 'lucide-react';

// Default spinner
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  message = null,
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
      {message && (
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3, avatar = false }) => {
  return (
    <div className="animate-pulse">
      {avatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Card skeleton
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
      
      <div className="h-10 bg-gray-100 rounded-lg"></div>
    </div>
  );
};

// Branded loading screen
export const BrandedLoader = ({ message = "Loading PitCrew AI..." }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-2xl">
            <Shield className="w-16 h-16 text-white animate-pulse" />
          </div>
        </div>

        {/* App Name */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          PitCrew AI
        </h2>

        {/* Loading Message */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-progress"></div>
        </div>

        {/* Sub-message */}
        <p className="text-sm text-gray-500 mt-4">Analyzing your repositories...</p>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 50%;
            margin-left: 25%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Analysis loading (specific for AI processing)
export const AnalysisLoader = ({ stage = "analyzing" }) => {
  const stages = {
    fetching: { icon: GitPullRequest, text: "Fetching PR changes...", color: "text-blue-600" },
    analyzing: { icon: Zap, text: "AI analyzing code...", color: "text-purple-600" },
    processing: { icon: Shield, text: "Processing results...", color: "text-green-600" }
  };

  const currentStage = stages[stage] || stages.analyzing;
  const StageIcon = currentStage.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="relative inline-block mb-4">
        {/* Spinning circle */}
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-600 border-r-purple-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        
        {/* Icon */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-full">
          <StageIcon className={`w-8 h-8 ${currentStage.color}`} />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {currentStage.text}
      </h3>
      <p className="text-sm text-gray-500">
        This may take a few moments
      </p>

      {/* Progress dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Inline loader (for buttons, etc.)
export const InlineLoader = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
};

// Loading overlay (for sections)
export const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Dots loader (minimal)
export const DotsLoader = ({ color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        ></div>
      ))}
    </div>
  );
};

// Pulse loader (simple)
export const PulseLoader = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}></div>
    </div>
  );
};

// Spinner with percentage
export const ProgressSpinner = ({ percentage = 0, size = 'md' }) => {
  const sizeClasses = {
    sm: { outer: 'w-12 h-12', inner: 'text-xs' },
    md: { outer: 'w-16 h-16', inner: 'text-sm' },
    lg: { outer: 'w-24 h-24', inner: 'text-base' }
  };

  const config = sizeClasses[size];

  return (
    <div className={`relative ${config.outer}`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
          className="text-blue-600 transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold text-gray-700 ${config.inner}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="grid gap-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 animate-pulse">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-100 rounded"
                  style={{ width: `${Math.random() * 30 + 70}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// List skeleton
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;