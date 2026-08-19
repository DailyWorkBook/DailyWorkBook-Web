import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

/**
 * Transient feedback. Every mutation reports its outcome here so an action
 * never appears to do nothing — success and failure both say so.
 */

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  notify: (tone: ToastTone, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_STYLES: Record<ToastTone, { icon: React.ElementType; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-brand-teal/30 bg-brand-teal/10 text-brand-teal' },
  error: { icon: XCircle, className: 'border-status-absent/30 bg-status-absent/10 text-status-absent' },
  warning: { icon: AlertTriangle, className: 'border-status-late/30 bg-status-late/10 text-status-late' },
  info: { icon: Info, className: 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary' },
};

let nextId = 1;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, tone, title, description }]);
      // Errors linger longer — they usually carry something to read.
      window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (title, description) => notify('success', title, description),
      error: (title, description) => notify('error', title, description),
      info: (title, description) => notify('info', title, description),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(24rem,calc(100vw-2rem))]"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const { icon: Icon, className } = TONE_STYLES[toast.tone];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className={`rounded-xl border shadow-lg backdrop-blur-md p-3 flex items-start gap-2.5 ${className}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-txt-primary">{toast.title}</div>
                  {toast.description && (
                    <div className="text-[11px] text-txt-secondary mt-0.5 leading-relaxed break-words">
                      {toast.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-txt-tertiary hover:text-txt-primary p-0.5 rounded flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
