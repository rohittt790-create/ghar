import React from 'react';
import { getStatusConfig, getPriorityConfig } from '../../utils/formatters.js';

interface BadgeProps {
  status?: string;
  priority?: string;
  category?: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  priority,
  category,
  label,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (status) {
    const config = getStatusConfig(status);
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  if (priority) {
    const config = getPriorityConfig(priority);
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-md border uppercase tracking-wider ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  if (category) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}
      >
        {category}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 ${sizeClasses} ${className}`}
    >
      {label}
    </span>
  );
};
