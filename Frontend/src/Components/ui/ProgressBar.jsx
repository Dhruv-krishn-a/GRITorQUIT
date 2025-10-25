import React from 'react';

const ProgressBar = ({ progress, className = '' }) => {
  return (
    <div className={`w-full bg-gray-700 rounded-full h-3 ${className}`}>
      <div
        className="bg-red-600 h-3 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;