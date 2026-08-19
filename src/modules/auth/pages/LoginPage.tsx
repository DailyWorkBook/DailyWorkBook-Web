import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../core/auth';
import { ApiError } from '../../../services';
import { firstAccessibleWorkspacePath } from '../../../core/navigation';
import { LoadingState } from '../../../components/feedback/States';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status, isAuthenticated, isSuperAdmin, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  if (status === 'loading') return <LoadingState label="Checking your session…" className="min-h-screen" />;

  if (isAuthenticated && user) {
    const destination = isSuperAdmin
      ? '/platform'
      : firstAccessibleWorkspacePath(user.modules, user.permissions);
    return <Navigate to={destination} replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const signedIn = await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      const destination =
        signedIn.actorType === 'SUPER_ADMIN'
          ? '/platform'
          : from && from !== '/login'
            ? from
            : firstAccessibleWorkspacePath(signedIn.modules, signedIn.permissions);
      navigate(destination, { replace: true });
    } catch (caught) {
      // The server deliberately gives one answer for a wrong password and an
      // unknown address; the form repeats it rather than guessing further.
      setError(caught instanceof ApiError ? caught.message : 'Sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-app">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-primary via-brand-primary-600 to-brand-teal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
            <ShieldCheck className="w-5 h-5" strokeWidth={2} aria-hidden />
          </div>
          <span className="text-lg font-extrabold tracking-tight">WatchTower</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative space-y-4 max-w-md"
        >
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Workforce attendance, under control.
          </h1>
          <p className="text-white/75 leading-relaxed">
            Sites, posts, shifts and rosters in one place — with every check-in reconciled against the deployment you
            actually planned.
          </p>
        </motion.div>

        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} WatchTower Attendance</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="lg:hidden flex items-center gap-2.5 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-teal flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} aria-hidden />
            </div>
            <span className="text-base font-extrabold text-txt-primary">WatchTower</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-txt-primary tracking-tight">Sign in</h2>
            <p className="text-xs text-txt-secondary">Use the credentials issued for your account.</p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-txt-secondary mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" aria-hidden />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] bg-bg-surface border border-border rounded-xl text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-txt-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" aria-hidden />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="w-full pl-9 pr-10 py-2.5 min-h-[44px] bg-bg-surface border border-border rounded-xl text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-txt-tertiary hover:text-txt-primary rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="text-[11px] text-txt-tertiary leading-relaxed text-center">
            Accounts are created by your administrator. If you cannot sign in, ask them to check your account or reset
            your password.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
