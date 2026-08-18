import React from 'react';
import { clsx } from 'clsx';

export type StatusType = 'PRESENT' | 'LATE_IN' | 'LATE_IN_HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'HALF_DAY_LEAVE' | 'EXCEPTION_PENDING' | 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className }) => {
  const getBadgeStyle = (s: string) => {
    switch (s.toUpperCase()) {
      case 'PRESENT':
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
      case 'LATE_IN':
      case 'LATE_IN_HALF_DAY':
        return 'bg-status-late/10 text-status-late border-status-late/20';
      case 'ABSENT':
      case 'REJECTED':
      case 'TERMINATED':
        return 'bg-status-absent/10 text-status-absent border-status-absent/20';
      case 'ON_LEAVE':
      case 'HALF_DAY_LEAVE':
        return 'bg-status-leave/10 text-status-leave border-status-leave/20';
      case 'EXCEPTION_PENDING':
      case 'PENDING':
      case 'ONBOARDING':
        return 'bg-status-pending/10 text-txt-secondary border-status-pending/20';
      default:
        return 'bg-bg-surface-2 text-txt-secondary border-border';
    }
  };

  const formatText = (s: string) => {
    if (label) return label;
    switch (s.toUpperCase()) {
      case 'LATE_IN': return 'Late Arrival';
      case 'LATE_IN_HALF_DAY': return 'Late Half-Day';
      case 'EXCEPTION_PENDING': return 'Pending Exception';
      case 'ON_LEAVE': return 'On Leave';
      case 'HALF_DAY_LEAVE': return 'Half-Day Leave';
      default: return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace('_', ' ');
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-semibold border tabular-nums transition-colors',
        getBadgeStyle(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formatText(status)}
    </span>
  );
};
