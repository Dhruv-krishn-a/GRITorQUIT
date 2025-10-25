import React from "react";
import { Link } from "react-router-dom";

const LoginForm = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onKeyDown,
  onSubmit,
  loading,
  message
}) => {
  return (
    <div className="absolute inset-0 flex justify-center items-center z-20">
      <form
        onSubmit={onSubmit}
        className="bg-black/40 backdrop-blur-md rounded-2xl shadow-xl p-10 w-96 flex flex-col gap-5 text-white animate-fadeIn relative"
      >
        {message && (
          <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full py-2 px-4 rounded-lg text-sm font-semibold z-10 shadow-lg ${
            message.isError ? 'bg-red-500/90' : 'bg-green-500/90'
          } text-white`}>
            {message.text}
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-wider">Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={onUsernameChange}
          onKeyDown={onKeyDown}
          disabled={loading}
          autoFocus
          className="p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
          onKeyDown={onKeyDown}
          disabled={loading}
          className="p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading}
          className={`py-3 font-semibold rounded-lg shadow-lg transition duration-300 ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-gray-300">
          Don't have an account?{" "}
          <Link to="/signup" className="text-cyan-400 underline hover:text-cyan-300">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;