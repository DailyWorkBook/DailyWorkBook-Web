import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../core/auth';
import { authApi } from '../../services';
import { describeApiError } from '../../hooks/useApiErrorMessage';
import { useToast } from '../../hooks';

/**
 * Shown to an account whose password was set by an administrator. Until it is
 * replaced, nobody but the account holder should be able to use the session.
 */
export const PasswordChangeGate: React.FC = () => {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('The two new passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password updated', 'Sign back in with your new password.');
      await refreshUser();
      window.location.assign('/login');
    } catch (caught) {
      setError(describeApiError(caught, 'The password could not be changed.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-bg-surface border border-border rounded-2xl p-7 shadow-lg space-y-5">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-brand-primary" strokeWidth={1.75} aria-hidden />
        </div>
        <h1 className="text-base font-bold text-txt-primary">Choose your own password</h1>
        <p className="text-xs text-txt-secondary leading-relaxed">
          Your password was set by an administrator. Replace it before continuing so only you know it.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label htmlFor="current-password" className="block text-xs font-bold text-txt-secondary mb-1">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full px-3 py-2.5 bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <div>
          <label htmlFor="new-password" className="block text-xs font-bold text-txt-secondary mb-1">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full px-3 py-2.5 bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
          <p className="text-[11px] text-txt-tertiary mt-1">
            At least 10 characters with an uppercase letter, a lowercase letter, a digit and a symbol.
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-bold text-txt-secondary mb-1">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full px-3 py-2.5 bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <Button type="submit" isLoading={isSaving} className="w-full" size="lg">
          Update password
        </Button>
      </form>
    </div>
  );
};
