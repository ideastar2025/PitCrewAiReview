import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandedLoader } from '../components/LoadingSpinner';

/**
 * PublicRoute Component
 * 
 * Wrapper component for routes that should only be accessible to non-authenticated users.
 * 
 * Fixes:
 * - Added null checks for auth context
 * - Added error boundary protection
 * - Fixed undefined context issues
 * - Added fallback states
 */
const PublicRoute = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const location = useLocation();
  
  // Use try-catch to handle context errors
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Auth context error in PublicRoute:', error);
    // If auth context fails, show the public page (login)
    return children;
  }

  // Destructure with default values to prevent undefined errors
  const { 
    isAuthenticated = false, 
    loading = true, 
    error = null 
  } = authContext || {};

  // Get the redirect path that was saved before login
  const getRedirectPath = () => {
    try {
      // Check if there's a saved redirect path from sessionStorage
      const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
      
      // Check if location state has a redirect path
      const stateRedirect = location?.state?.from?.pathname;
      
      // Priority: state > sessionStorage > default
      return stateRedirect || savedRedirect || redirectTo;
    } catch (error) {
      console.error('Error getting redirect path:', error);
      return redirectTo;
    }
  };

  // Clear saved redirect path after determining where to go
  useEffect(() => {
    if (isAuthenticated && !loading) {
      try {
        // Clear the saved redirect path since we're redirecting now
        sessionStorage.removeItem('redirectAfterLogin');
      } catch (error) {
        console.error('Error clearing redirect path:', error);
      }
    }
  }, [isAuthenticated, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <BrandedLoader 
        message="Loading PitCrew AI..." 
      />
    );
  }

  // Handle authentication errors
  // Even if there's an error, still show the public page (login)
  if (error) {
    console.error('Authentication error in PublicRoute:', error);
    // Don't redirect, let user access login page
    return children;
  }

  // Redirect to dashboard (or saved path) if already authenticated
  if (isAuthenticated) {
    const redirectPath = getRedirectPath();
    
    return (
      <Navigate 
        to={redirectPath} 
        replace 
      />
    );
  }

  // User is not authenticated, show the public page (login/signup)
  return children;
};

export default PublicRoute;