import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

/**
 * RiskScoreCard Component
 * Displays risk score with visual indicators
 */
const RiskScoreCard = ({ 
  score = 0, 
  previousScore = null,
  title = "Risk Score",
  showTrend = false,
  size = "medium",
  issues = null,
  className = ""
}) => {
  // Calculate risk level
  const getRiskLevel = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel(score);

  // Color schemes for different risk levels
  const colorSchemes = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      scoreText: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
      icon: AlertTriangle
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      scoreText: 'text-yellow-600',
      gradient: 'from-yellow-500 to-yellow-600',
      icon: Shield
    },
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      scoreText: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      icon: CheckCircle2
    }
  };

  const scheme = colorSchemes[riskLevel];
  const Icon = scheme.icon;

  // Calculate trend
  const trend = previousScore !== null ? score - previousScore : null;
  const trendPercentage = previousScore !== null && previousScore !== 0 
    ? ((trend / previousScore) * 100).toFixed(1) 
    : null;

  // Size variants
  const sizeClasses = {
    small: {
      container: 'p-4',
      score: 'text-3xl',
      icon: 'w-8 h-8',
      title: 'text-sm'
    },
    medium: {
      container: 'p-6',
      score: 'text-4xl',
      icon: 'w-10 h-10',
      title: 'text-base'
    },
    large: {
      container: 'p-8',
      score: 'text-6xl',
      icon: 'w-12 h-12',
      title: 'text-lg'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className={`${scheme.bg} ${scheme.border} border-2 rounded-xl ${sizes.container} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${scheme.text} font-semibold ${sizes.title}`}>{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${scheme.gradient}`}>
          <Icon className={`${sizes.icon} text-white`} />
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-baseline space-x-2 mb-2">
        <div className={`${scheme.scoreText} ${sizes.score} font-bold`}>
          {score}
        </div>
        <span className={`${scheme.text} text-sm`}>/ 100</span>
      </div>

      {/* Risk Level Label */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        </span>
      </div>

      {/* Trend Indicator */}
      {showTrend && trend !== null && (
        <div className="flex items-center space-x-2 mb-4">
          {trend < 0 ? (
            <>
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                {Math.abs(trendPercentage)}% improvement
              </span>
            </>
          ) : trend > 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">
                +{trendPercentage}% increase
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-600 font-medium">
              No change
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full bg-gradient-to-r ${scheme.gradient} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Issues Breakdown (if provided) */}
      {issues && Array.isArray(issues) && issues.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs ${scheme.text} font-semibold mb-2`}>Issues Found:</p>
          {issues.map((issue, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className={scheme.text}>
                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}:
              </span>
              <span className={`font-semibold ${scheme.scoreText}`}>
                {issue.count || issue.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Description based on risk level */}
      <p className={`text-xs ${scheme.text} opacity-75 mt-4`}>
        {riskLevel === 'high' && 'Immediate attention required. Multiple critical issues detected.'}
        {riskLevel === 'medium' && 'Review recommended. Some concerns need attention.'}
        {riskLevel === 'low' && 'Looks good! Minor improvements suggested.'}
      </p>
    </div>
  );
};

/**
 * RiskScoreBadge - Compact version for inline display
 */
export const RiskScoreBadge = ({ score = 0, showLabel = true, size = 'md' }) => {
  const getRiskLevel = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel(score);

  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full font-semibold border ${colors[riskLevel]} ${sizes[size]}`}>
      {showLabel && <span>{riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}</span>}
      <span>{score}</span>
    </span>
  );
};

export default RiskScoreCard;