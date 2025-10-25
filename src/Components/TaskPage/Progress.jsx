import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Progress({ current, total }) {
  return (
    <div className="flex items-center space-x-1 text-sm text-gray-400">
      <CheckCircle2 size={14} />
      <span>
        {current}/{total}
      </span>
    </div>
  );
}