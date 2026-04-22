'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  size = 'md',
}: MetricCardProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
    success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
    warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
    default: 'bg-gradient-to-br from-slate-50 to-slate-25 border-slate-100',
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const valueTextSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const iconColor = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    default: 'text-slate-600',
  };

  return (
    <div
      className={`rounded-2xl border ${variantStyles[variant]} ${sizeStyles[size]} shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className={`${valueTextSize[size]} font-bold text-gray-900`}>
            {value}
          </p>
        </div>
        {Icon && (
          <Icon className={`h-8 w-8 ${iconColor[variant]}`} />
        )}
      </div>
    </div>
  );
}
