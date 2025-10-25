import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoginForm from "../Components/LoginForm";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const TOTAL_FRAMES = 192;
const TYPING_DELAY = 300;

const LoginScreen = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [frameIndex, setFrameIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const targetFrame = useRef(1);
  const typingTimeout = useRef(null);

  // Preload all frames
  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/frames/${i}.jpg`;
    }
  }, []);

  // Smooth animation loop
  useEffect(() => {
    let animFrame;
    const animate = () => {
      if (frameIndex < targetFrame.current) {
        setFrameIndex((prev) => Math.min(prev + 1, targetFrame.current));
      } else if (frameIndex > targetFrame.current) {
        setFrameIndex((prev) => Math.max(prev - 1, targetFrame.current));
      }
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [frameIndex]);

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const calculateTargetFrame = () => {
    const totalChars = username.length + password.length;
    const frame = Math.min(Math.ceil((totalChars / 30) * TOTAL_FRAMES), TOTAL_FRAMES);
    targetFrame.current = Math.max(frame, 1);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      calculateTargetFrame();
    }, TYPING_DELAY);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        calculateTargetFrame();
      }, TYPING_DELAY);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password) {
      showMessage("Username and password are required");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // Animate shutter fully open
      targetFrame.current = TOTAL_FRAMES;
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (frameIndex === TOTAL_FRAMES) {
            clearInterval(check);
            resolve();
          }
        }, 10);
      });

      const res = await axios.post(
        `${BACKEND_URL}/api/auth/login`, 
        { 
          username: username.trim(), 
          password 
        },
        { timeout: 10000 }
      );
      
      const { token, username: returnedUsername, userId } = res.data;

      if (token && onLoginSuccess) {
        onLoginSuccess(token, returnedUsername || username.trim(), userId);
        showMessage("Login successful! Redirecting...", false);
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "Login failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if backend is running.";
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your connection.";
      }
      
      showMessage(errorMessage);
      targetFrame.current = 1;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen shutter background */}
      <img
        src={`/frames/${frameIndex}.jpg`}
        alt="Shutter animation"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      {/* Overlayed Login Form */}
      <LoginForm
        username={username}
        password={password}
        onUsernameChange={handleInputChange(setUsername)}
        onPasswordChange={handleInputChange(setPassword)}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      />
    </div>
  );
};

export default LoginScreen;