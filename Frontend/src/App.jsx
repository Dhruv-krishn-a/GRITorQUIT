// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TaskPage";
import PlanningPage from "./pages/PlanningPage";
import AnalyticsPage from "./pages/AnalyticsPage"; // Make sure this import exists

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");

      if (storedToken && !storedUsername) {
        try {
          const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
          const res = await fetch(`${BACKEND_URL}/api/user/me`, {
            headers: { 
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            setUsername(data.username);
            localStorage.setItem("username", data.username);
          } else {
            throw new Error("Invalid token");
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          handleLogout();
        }
      } else if (storedToken && storedUsername) {
        setToken(storedToken);
        setUsername(storedUsername);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (newToken, newUsername) => {
    console.log("Login success:", { newToken, newUsername });
    setToken(newToken);
    setUsername(newUsername || null);
    localStorage.setItem("token", newToken);
    if (newUsername) {
      localStorage.setItem("username", newUsername);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setToken(null);
    setUsername(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )
        } 
      />
      
      <Route 
        path="/signup" 
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupScreen onSignupSuccess={handleLoginSuccess} />
          )
        } 
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard username={username} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage username={username} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <PlanningPage username={username} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      
      {/* FIXED: Correct spelling and point to AnalyticsPage */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage username={username} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      
      {/* Default route */}
      <Route 
        path="/" 
        element={
          <Navigate to={token ? "/dashboard" : "/login"} replace />
        } 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          <Navigate to={token ? "/dashboard" : "/login"} replace />
        } 
      />
    </Routes>
  );
}

export default App;