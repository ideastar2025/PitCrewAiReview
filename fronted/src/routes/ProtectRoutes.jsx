import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import { BrandedLoader } from "../components/LoadingSpinner";

/**
 * ProtectedRoute Component
 *
 * Wrapper component that protects routes from unauthorized access.
 * Ensures only authenticated users can access protected pages.
 *
 * Features:
 * - Checks if user is authenticated
 * - Shows loading spinner while checking auth status
 * - Redirects to login page if not authenticated
 * - Saves attempted URL for redirect after login
 * - Handles auth errors gracefully
 * - Supports role-based access control
 * - Supports permission-based access control
 *
 * Usage:
 * Basic:
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   }
 * />
 *
 * With Role Check:
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute requireRole="admin">
 *       <AdminPanel />
 *     </ProtectedRoute>
 *   }
 * />
 *
 * With Permission Check:
 * <Route
 *   path="/settings"
 *   element={
 *     <ProtectedRoute requirePermission="manage_settings">
 *       <Settings />
 *     </ProtectedRoute>
 *   }
 * />
 */
const ProtectRoute = ({
  children,
  requireRole = null,
  requirePermission = null,
  redirectTo = "/login",
  fallbackPath = "/dashboard",
}) => {
  const { isAuthenticated, loading, user, error } = useAuth();
  const location = useLocation();

  // Save the attempted location for redirecting after login
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      // Store the full path (including query params) user was trying to access
      const fullPath = location.pathname + location.search + location.hash;
      sessionStorage.setItem("redirectAfterLogin", fullPath);

      // Also store in session for debugging
      console.log("Saving redirect path:", fullPath);
    }
  }, [isAuthenticated, loading, location]);

  // Clear redirect path when user successfully accesses a protected route
  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Only clear if we're on the intended page
      const savedPath = sessionStorage.getItem("redirectAfterLogin");
      if (savedPath === location.pathname + location.search + location.hash) {
        sessionStorage.removeItem("redirectAfterLogin");
        console.log("Cleared redirect path - user reached destination");
      }
    }
  }, [isAuthenticated, loading, location]);

  // Show loading state while checking authentication
  if (loading) {
    return <BrandedLoader message="Verifying authentication..." />;
  }

  // Handle authentication errors
  if (error) {
    console.error("Authentication error in ProtectedRoute:", error);

    // Clear any stale auth data
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login with error message
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          error: "Your session has expired. Please login again.",
        }}
        replace
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          message: "Please login to continue",
        }}
        replace
      />
    );
  }

  // Check role requirement if specified
  if (requireRole && user) {
    const userRole = user.role || user.userRole || "user";

    if (userRole !== requireRole) {
      console.warn(
        `Access denied: User role "${userRole}" does not match required role "${requireRole}"`
      );

      return (
        <Navigate
          to={fallbackPath}
          state={{
            error: `Access denied. This page requires ${requireRole} role.`,
            from: location,
          }}
          replace
        />
      );
    }
  }

  // Check permission requirement if specified
  if (requirePermission && user) {
    const userPermissions = user.permissions || [];

    if (!userPermissions.includes(requirePermission)) {
      console.warn(
        `Access denied: User lacks required permission "${requirePermission}"`
      );

      return (
        <Navigate
          to={fallbackPath}
          state={{
            error: "You do not have permission to access this page.",
            from: location,
          }}
          replace
        />
      );
    }
  }

  // Check if user has multiple required roles (any of them)
  if (requireRole && Array.isArray(requireRole) && user) {
    const userRole = user.role || user.userRole || "user";

    if (!requireRole.includes(userRole)) {
      console.warn(
        `Access denied: User role "${userRole}" not in allowed roles:`,
        requireRole
      );

      return (
        <Navigate
          to={fallbackPath}
          state={{
            error: "Access denied. Insufficient privileges.",
            from: location,
          }}
          replace
        />
      );
    }
  }

  // Check if user has multiple required permissions (all of them)
  if (requirePermission && Array.isArray(requirePermission) && user) {
    const userPermissions = user.permissions || [];
    const hasAllPermissions = requirePermission.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      console.warn(
        "Access denied: User lacks one or more required permissions:",
        requirePermission
      );

      return (
        <Navigate
          to={fallbackPath}
          state={{
            error:
              "You do not have all required permissions to access this page.",
            from: location,
          }}
          replace
        />
      );
    }
  }

  // User is authenticated and authorized, render the protected content
  return children;
};

/**
 * Helper function to check if user has role
 * Can be used in components for conditional rendering
 */
export const useHasRole = (role) => {
  const { user } = useAuth();
  const userRole = user?.role || user?.userRole || "user";

  if (Array.isArray(role)) {
    return role.includes(userRole);
  }

  return userRole === role;
};

/**
 * Helper function to check if user has permission
 * Can be used in components for conditional rendering
 */
export const useHasPermission = (permission) => {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];

  if (Array.isArray(permission)) {
    return permission.every((perm) => userPermissions.includes(perm));
  }

  return userPermissions.includes(permission);
};

/**
 * Higher-order component for protecting components
 * Alternative to using ProtectedRoute in routes
 */
export const withAuth = (Component, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectRoute;
