import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary, { NotFound } from './components/ErrorBoundary';
import ProtectRoutes from './routes/ProtectRoutes';
import PublicRoute from './routes/PublicRoutes';

// Pages
import Login from './pages/Login';
import DashboardPage from './pages/Dashboard';
import Repos from './pages/Repos';
import Settings from './pages/Settings';

/**
 * Main Application Component
 * 
 * Sets up the application routing, context providers, and error boundaries.
 * 
 * Structure:
 * - ErrorBoundary: Catches and handles React errors
 * - ThemeProvider: Manages light/dark theme
 * - AuthProvider: Manages authentication state
 * - BrowserRouter: Handles client-side routing
 * 
 * Routes:
 * - Public routes: Login page (redirects to dashboard if authenticated)
 * - Protected routes: Dashboard, Repositories, Settings (requires authentication)
 * - Default route: Redirects to dashboard
 * - 404 route: Shows not found page for invalid URLs
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectRoutes>
                    <DashboardPage />
                  </ProtectRoutes>
                }
              />

              <Route
                path="/repositories"
                element={
                  <ProtectRoutes>
                    <Repos />
                  </ProtectRoutes>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectRoutes>
                    <Settings />
                  </ProtectRoutes>
                }
              />

              {/* Default Route - Redirect to Dashboard */}
              <Route 
                path="/" 
                element={<Navigate to="/dashboard" replace />} 
              />

              {/* 404 Not Found Route */}
              <Route 
                path="*" 
                element={<NotFound />} 
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;