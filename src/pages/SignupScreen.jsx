// src/components/ThreeJs/SignupScreen.jsx
import React from "react";
import SignupForm from "../Components/SignupForm";
import Scene from "../Components/ThreeJs/Scene";

const SignupScreen = ({ onSignupSuccess }) => {
  return (
    <div className="w-screen h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 overflow-hidden">
      {/* 3D background scene */}
      <Scene />

      {/* Signup Form Overlay */}
      <SignupForm onSignupSuccess={onSignupSuccess} />

      {/* subtle overlay for readability */}
      {/* <div className="absolute inset-0 bg-black/30 pointer-events-none" /> */}
    </div>
  );
};
export default SignupScreen;
