import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getGradient = (val: number) => {
    if (val >= 100) return 'bg-emerald-500';
    if (val >= 60) return 'bg-gradient-to-r from-brand-500 to-emerald-500';
    if (val >= 30) return 'bg-gradient-to-r from-amber-500 to-brand-500';
    return 'bg-gradient-to-r from-amber-500 to-orange-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1 font-medium">
          <span>Overall Progress</span>
          <span className="font-semibold text-slate-800">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getGradient(
            clamped
          )}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
