//Frontend/src/Components/TaskPage/ModuleCard.jsx
import React from 'react';

/**
 * A generic dark-themed card component.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be displayed inside the card.
 * @param {string} [props.className] - Additional CSS classes to apply to the card.
 */
export default function ModuleCard({ children, className = '' }) {
  return (
    <div
      className={`bg-gray-900 rounded-lg shadow-xl border border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}