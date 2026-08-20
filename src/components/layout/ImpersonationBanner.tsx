import React, { useState } from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../core/auth';

/**
 * The standing reminder that this workspace is being viewed by a platform
 * operator, not its owner.
 *
 * Always visible, never dismissible: an operator who forgets which tab they are
 * in is exactly the situation this feature has to make impossible.
 */
export const ImpersonationBanner: React.FC = () => {
  const { impersonation, user, endImpersonation } = useAuth();
  const [ending, setEnding] = useState(false);

  if (!impersonation) return null;

  const handleEnd = async () => {
    setEnding(true);
    try {
      await endImpersonation();
      // The tab was opened for this session alone, so closing it is the natural
      // end. Browsers refuse `close()` on tabs a script did not open, in which
      // case the app has already signed out and shows the login screen.
      window.close();
    } finally {
      setEnding(false);
    }
  };

  const expires = new Date(impersonation.expiresAt);

  return (
    <div
      role="status"
      className="sticky top-0 z-40 bg-amber-500 text-slate-950 border-b border-amber-600/40 shadow-sm"
    >
      <div className="max-w-[1700px] mx-auto px-4 md:px-8 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="flex items-center gap-2 text-[11px] md:text-xs font-bold min-w-0">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" aria-hidden />
          <span className="truncate">
            Support session — you are signed in as <strong>{user?.name}</strong>
            {user?.clientName ? ` at ${user.clientName}` : ''} for {impersonation.by}. This session and everything you
            do in it is recorded, and ends by{' '}
            {expires.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.
          </span>
        </p>

        <button
          type="button"
          onClick={() => void handleEnd()}
          disabled={ending}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/85 text-amber-300 text-[11px] font-bold hover:bg-slate-950 transition-colors disabled:opacity-60 flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden />
          {ending ? 'Ending…' : 'End session'}
        </button>
      </div>
    </div>
  );
};
