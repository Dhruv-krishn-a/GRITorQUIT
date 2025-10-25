import React from 'react';

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false }) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-800',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500 disabled:bg-gray-800',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 focus:ring-gray-500 disabled:text-gray-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;