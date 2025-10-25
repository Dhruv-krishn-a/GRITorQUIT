import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignupForm = ({ onSignupSuccess, inline = false, formSize, standaloneCircular = false }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!username.trim() || !password) {
      showMessage("Username and password are required");
      return;
    }

    if (username.trim().length < 3) {
      showMessage("Username must be at least 3 characters");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await axios.post(
        `${BACKEND_URL}/api/auth/signup`,
        {
          username: username.trim(),
          password,
        },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );

      const { token, username: returnedUsername, userId } = res.data;
      
      if (token && onSignupSuccess) {
        onSignupSuccess(token, returnedUsername || username.trim(), userId);
        showMessage("Signup successful! Redirecting...", false);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        showMessage("Signup failed: No token received");
      }
    } catch (err) {
      console.error("Signup error:", err);
      
      let errorMessage = "Signup failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if backend is running.";
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex justify-center items-center z-30 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-black/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4 text-white relative"
      >
        {message && (
          <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full py-2 px-4 rounded-lg text-sm font-semibold z-10 shadow-lg ${
            message.isError ? 'bg-red-500/90' : 'bg-green-500/90'
          } text-white`}>
            {message.text}
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-wider">Sign Up</h1>
        
        <div className="space-y-4">
          <input
            type="text"
            aria-label="username"
            placeholder="Username (min 3 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
          />
          
          <input
            type="password"
            aria-label="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
          />
          
          <input
            type="password"
            aria-label="confirm-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 font-semibold rounded-lg shadow-lg transition duration-300 ${
            loading 
              ? "bg-gray-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105"
          }`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 underline hover:text-cyan-300">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;