import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit when the content supplies its own header, as the mobile nav does. */
  title?: string;
  children: React.ReactNode;
  side?: 'right' | 'left';
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' }
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={sideVariants[side].initial}
            animate={sideVariants[side].animate}
            exit={sideVariants[side].exit}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            className={`relative ${side === 'right' ? 'ml-auto' : 'mr-auto'} w-full max-w-lg bg-bg-surface ${side === 'right' ? 'border-l' : 'border-r'} border-border h-full shadow-2xl z-10 flex flex-col`}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-bold text-txt-primary">{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1.5 text-txt-secondary hover:text-txt-primary rounded-lg hover:bg-bg-surface-2 transition-colors"
                >
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>
            )}

            <div className={`flex-1 overflow-y-auto ${title ? 'p-6' : ''}`}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
