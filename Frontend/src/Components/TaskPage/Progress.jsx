import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Progress({ current, total }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <CheckCircle2 size={12} />
        <span>{current}/{total}</span>
      </div>
      
      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <span className="text-xs text-gray-400">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}