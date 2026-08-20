import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { LoadingState } from '../../../components/feedback/States';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../core/auth';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { firstAccessibleWorkspacePath } from '../../../core/navigation';

/**
 * Where the new tab lands when an operator starts a bypass session.
 *
 * The ticket arrives in the URL because that is the only channel a freshly
 * opened tab has. It is spent here immediately, over POST, and stripped from
 * the address bar so it does not linger in history — and it is single-use and
 * short-lived, so a copied link is worthless by the time anyone reads it.
 */
export const ImpersonationCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { beginImpersonation } = useAuth();
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // A link with no ticket is a fact about the URL, not something that has to be
  // discovered by running an effect — so it is derived here during render.
  const ticket = params.get('ticket');

  // React mounts effects twice in development; the ticket is single-use, so a
  // second redemption would fail and show a spurious error.
  const redeemed = useRef(false);

  useEffect(() => {
    if (!ticket || redeemed.current) return;
    redeemed.current = true;

    // Strip the ticket from the address bar before anything else happens.
    window.history.replaceState({}, '', window.location.pathname);

    // Redeeming is a genuine external-system exchange: the state update happens
    // only after the request settles, never synchronously inside the effect.
    void (async () => {
      try {
        const user = await beginImpersonation(ticket);
        const destination = firstAccessibleWorkspacePath(user.modules, user.permissions);
        navigate(destination === '/' ? '/dashboard' : destination, { replace: true });
      } catch (cause) {
        setRedeemError(describeApiError(cause));
      }
    })();
  }, [ticket, beginImpersonation, navigate]);

  const error = ticket
    ? redeemError
    : 'This support link is missing its ticket. Start the session again from the console.';

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
        <div className="max-w-md w-full bg-bg-surface border border-border rounded-2xl p-6 space-y-4 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 grid place-items-center mx-auto">
            <ShieldAlert className="w-6 h-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-extrabold text-txt-primary">Support session could not start</h1>
            <p className="text-xs text-txt-secondary leading-relaxed">{error}</p>
          </div>
          <Button variant="outline" onClick={() => window.close()} className="w-full">
            Close this tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-bg-base">
      <div className="space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center mx-auto">
          <ShieldCheck className="w-6 h-6" aria-hidden />
        </div>
        <LoadingState label="Opening the client workspace…" />
      </div>
    </div>
  );
};
