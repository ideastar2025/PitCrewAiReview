// ============================================
// Example 1: Dashboard Component
// ============================================

import React, { useEffect, useState } from "react";
import { reposAPI, handleApiError } from "../utils/api";

function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reposAPI.getAll();
      setRepos(data.repositories || []);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error("Failed to load repositories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (repoId) => {
    try {
      await reposAPI.sync(repoId);
      alert("Repository sync started!");
      loadRepositories(); // Reload list
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  if (loading) return <div>Loading repositories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Repositories</h1>
      {repos.length === 0 ? (
        <p>No repositories found. Connect a repository to get started.</p>
      ) : (
        <ul>
          {repos.map((repo) => (
            <li key={repo.id}>
              {repo.name}
              <button onClick={() => handleSync(repo.id)}>Sync</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// Example 2: Login Component
// ============================================

import React, { useState } from "react";
import { authAPI, handleApiError } from "../utils/api";
import { initSession } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function TestLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.loginWithCredentials(username, password);

      // Initialize session
      initSession(response.token, response.user);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Test Login</h2>
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

// ============================================
// Example 3: Auth Callback Handler
// ============================================

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI, handleApiError } from "../utils/api";
import { initSession } from "../utils/auth";

function AuthCallback() {
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get("code");
    const provider = searchParams.get("provider") || "github";
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setError(`OAuth error: ${errorParam}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setError("No authorization code received");
      return;
    }

    try {
      // Call the appropriate callback based on provider
      const response =
        provider === "github"
          ? await authAPI.githubCallback(code)
          : await authAPI.bitbucketCallback(code);

      // Initialize session
      initSession(response.token, response.user, provider);

      setStatus("success");

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Auth callback error:", err);
      setStatus("error");
      setError(handleApiError(err));
    }
  };

  return (
    <div>
      {status === "processing" && <div>Authenticating...</div>}
      {status === "success" && <div>Success! Redirecting...</div>}
      {status === "error" && (
        <div>
          <div>Authentication failed: {error}</div>
          <button onClick={() => navigate("/")}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 4: Reviews List Component
// ============================================

import React, { useEffect, useState } from "react";
import { reviewsAPI, handleApiError } from "../utils/api";

function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    repo_id: "",
  });

  useEffect(() => {
    loadReviews();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only include non-empty filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const data = await reviewsAPI.getAll(activeFilters);
      setReviews(data.reviews || data.results || []);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const triggerReview = async (prId) => {
    try {
      await reviewsAPI.triggerReview(prId);
      alert("Review triggered successfully!");
      loadReviews(); // Reload list
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Code Reviews</h1>

      {/* Filters */}
      <div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="changes_requested">Changes Requested</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p>No reviews found</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <h3>{review.title}</h3>
              <p>Status: {review.status}</p>
              <button onClick={() => triggerReview(review.pull_request_id)}>
                Trigger AI Review
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// Example 5: Using the generic api object
// ============================================

import { api, handleApiError } from "../utils/api";

// GET request
async function fetchData() {
  try {
    const data = await api.get("/api/repos/repositories/");
    console.log("Repositories:", data);
  } catch (err) {
    console.error(handleApiError(err));
  }
}

// POST request
async function createRepository(repoData) {
  try {
    const result = await api.post("/api/repos/repositories/", repoData);
    console.log("Created:", result);
  } catch (err) {
    console.error(handleApiError(err));
  }
}

// PATCH request
async function updateRepository(repoId, updates) {
  try {
    const result = await api.patch(
      `/api/repos/repositories/${repoId}/`,
      updates
    );
    console.log("Updated:", result);
  } catch (err) {
    console.error(handleApiError(err));
  }
}

// DELETE request
async function deleteRepository(repoId) {
  try {
    await api.delete(`/api/repos/repositories/${repoId}/`);
    console.log("Deleted successfully");
  } catch (err) {
    console.error(handleApiError(err));
  }
}

// ============================================
// Example 6: Protected Route Component
// ============================================

import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

function ProtectedRoute({ children }) {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
}

// Usage in Router:
// <Route
//   path="/dashboard"
//   element={
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   }
// />

export {
  Dashboard,
  TestLogin,
  AuthCallback,
  ReviewsList,
  ProtectedRoute,
  fetchData,
  createRepository,
  updateRepository,
  deleteRepository,
};
