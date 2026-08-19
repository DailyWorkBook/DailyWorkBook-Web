import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Inbox, Loader2, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * The four states every data region can be in.
 *
 * Screens render one of these rather than an empty div, so "nothing here yet",
 * "still loading", "you cannot see this" and "something went wrong" are always
 * visibly different — which is the difference between a working empty workspace
 * and one that looks broken.
 */

export const LoadingState: React.FC<{ label?: string; className?: string }> = ({
  label = 'Loading…',
  className = '',
}) => (
  <div className={`flex items-center justify-center gap-2.5 p-12 text-xs text-txt-secondary ${className}`}>
    <Loader2 className="w-4 h-4 animate-spin text-brand-primary" aria-hidden />
    <span>{label}</span>
    <span className="sr-only" role="status" aria-live="polite">
      {label}
    </span>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 5 }) => (
  <div className="space-y-2 p-4" aria-hidden>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-3">
        {Array.from({ length: columns }).map((__, columnIndex) => (
          <div
            key={columnIndex}
            className="h-8 flex-1 rounded-lg bg-bg-surface-2 animate-pulse"
            style={{ animationDelay: `${(rowIndex * columns + columnIndex) * 25}ms` }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 4, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} aria-hidden>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="h-28 rounded-2xl bg-bg-surface-2 animate-pulse" style={{ animationDelay: `${index * 60}ms` }} />
    ))}
  </div>
);

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: React.ReactNode };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    className={`text-center p-12 bg-bg-surface border border-border rounded-2xl space-y-3 ${className}`}
  >
    <div className="w-14 h-14 mx-auto rounded-2xl bg-bg-surface-2 border border-border flex items-center justify-center">
      <Icon className="w-6 h-6 text-txt-tertiary" strokeWidth={1.75} aria-hidden />
    </div>
    <h3 className="text-base font-bold text-txt-primary">{title}</h3>
    {description && <p className="text-xs text-txt-secondary max-w-md mx-auto leading-relaxed">{description}</p>}
    {(action || secondaryAction) && (
      <div className="flex items-center justify-center gap-2 pt-2">
        {action && (
          <Button onClick={action.onClick} leftIcon={action.icon}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    )}
  </motion.div>
);

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => (
  <div
    role="alert"
    className={`text-center p-10 bg-status-absent/5 border border-status-absent/25 rounded-2xl space-y-3 ${className}`}
  >
    <div className="w-12 h-12 mx-auto rounded-2xl bg-status-absent/10 flex items-center justify-center">
      <AlertTriangle className="w-5 h-5 text-status-absent" strokeWidth={1.75} aria-hidden />
    </div>
    <h3 className="text-sm font-bold text-txt-primary">{title}</h3>
    <p className="text-xs text-txt-secondary max-w-md mx-auto leading-relaxed">{message}</p>
    {onRetry && (
      <Button variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
        Try again
      </Button>
    )}
  </div>
);

/** Shown when the workspace does not own the module behind a screen. */
export const ModuleLockedState: React.FC<{ moduleName: string; className?: string }> = ({ moduleName, className = '' }) => (
  <div className={`text-center p-12 bg-bg-surface border border-border rounded-2xl space-y-3 ${className}`}>
    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
      <Lock className="w-6 h-6 text-amber-600" strokeWidth={1.75} aria-hidden />
    </div>
    <h3 className="text-base font-bold text-txt-primary">{moduleName} is not part of your plan</h3>
    <p className="text-xs text-txt-secondary max-w-md mx-auto leading-relaxed">
      This module has not been assigned to your organisation. Contact your platform administrator if you need it enabled.
    </p>
  </div>
);

/** Shown when the module is owned but the signed-in role lacks the permission. */
export const PermissionDeniedState: React.FC<{ action?: string; className?: string }> = ({
  action = 'view this',
  className = '',
}) => (
  <div className={`text-center p-12 bg-bg-surface border border-border rounded-2xl space-y-3 ${className}`}>
    <div className="w-14 h-14 mx-auto rounded-2xl bg-status-absent/10 flex items-center justify-center">
      <ShieldAlert className="w-6 h-6 text-status-absent" strokeWidth={1.75} aria-hidden />
    </div>
    <h3 className="text-base font-bold text-txt-primary">You do not have access</h3>
    <p className="text-xs text-txt-secondary max-w-md mx-auto leading-relaxed">
      Your role does not allow you to {action}. Ask a workspace administrator to adjust your permissions.
    </p>
  </div>
);
