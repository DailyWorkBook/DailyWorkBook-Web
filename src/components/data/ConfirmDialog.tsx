import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'destructive';
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  isBusy = false,
  onConfirm,
  onCancel,
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isBusy ? undefined : onCancel}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-bg-surface border border-border rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                tone === 'destructive' ? 'bg-status-absent/10 text-status-absent' : 'bg-brand-primary/10 text-brand-primary'
              }`}
            >
              <AlertTriangle className="w-5 h-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-txt-primary">{title}</h3>
              <p className="text-xs text-txt-secondary mt-1 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onCancel} disabled={isBusy}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === 'destructive' ? 'destructive' : 'primary'}
              onClick={onConfirm}
              isLoading={isBusy}
            >
              {confirmLabel}
            </Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
