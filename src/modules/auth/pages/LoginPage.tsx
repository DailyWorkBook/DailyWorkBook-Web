import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, Sparkles, Building2, Crown } from 'lucide-react';
import { useAuth } from '../../../core/auth';

const FEATURES = [
  'Automated geofence check-in classification',
  'Live shift conflict detection & roster guard',
  'Dual-control exception approval workflow',
  'Audit log with immutable compliance trail',
  'Role-based access control (RBAC) engine'
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('superadmin@watchtower.dev');
  const [password, setPassword] = useState('WatchTower@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [featIdx, setFeatIdx] = useState(0);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated]);

  // Cycle features
  useEffect(() => {
    const t = setInterval(() => setFeatIdx((i) => (i + 1) % FEATURES.length), 2800);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await login(email, password);
      setIsLoading(false);
      if (success) {
        if (email.toLowerCase().includes('superadmin')) navigate('/superadmin/dashboard');
        else navigate('/');
      } else {
        setError('Invalid credentials. Check email and password.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-app flex flex-col md:flex-row selection:bg-brand-primary/20">
      {/* ── LEFT: Dark Brand Hero ── */}
      <div
        className="md:w-[52%] relative flex flex-col justify-between p-8 lg:p-14 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1120 0%, #0E1B34 50%, #0F2050 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2F6BFF 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00D4B2 0%, transparent 70%)' }}
        />

        {/* Top Logo Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-blue-400 flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">WatchTower</span>
              <span className="text-[10px] font-mono block text-blue-300/70 uppercase tracking-widest -mt-1">
                Enterprise Attendance
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md">
            v2.4 Production Database
          </span>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Multi-Tenant Workforce Security Platform
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Security Guard Tracking & Attendance Infrastructure
          </h1>

          <p className="text-sm text-blue-100/70 leading-relaxed">
            Enterprise multi-tenant platform with live geofence verification, shift conflict detection, and passwordless Super Admin tenant control.
          </p>

          {/* Dynamic feature highlight pill */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
            <div className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              Platform Feature &bull; {featIdx + 1}/{FEATURES.length}
            </div>
            <motion.div
              key={featIdx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 text-sm text-white font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{FEATURES[featIdx]}</span>
            </motion.div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-blue-200/50 flex items-center justify-between border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} WatchTower Security Systems. All rights reserved.</span>
          <span className="font-mono">MariaDB / MySQL Engine</span>
        </div>
      </div>

      {/* ── RIGHT: Login Form Card ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-bg-surface">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-txt-primary tracking-tight">Sign In to Dashboard</h2>
            <p className="text-xs text-txt-secondary">
              Enter your registered organization administrator credentials to access your control panel.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-txt-primary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-bg-surface border border-border rounded-btn text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-bg-surface border border-border rounded-btn text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-tertiary hover:text-txt-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-600 active:bg-brand-primary-700 text-white text-sm font-bold rounded-btn shadow-lg shadow-brand-primary/30 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Console <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Credentials Notice Box */}
          <div className="p-4 bg-bg-surface-2 border border-border rounded-2xl space-y-2 text-xs">
            <div className="font-bold text-txt-primary flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Platform Authentication Guide
            </div>
            <div className="text-[11px] text-txt-secondary space-y-1">
              <div>
                &bull; <strong className="text-txt-primary">Super Admin:</strong> Log in with <code className="bg-bg-surface px-1.5 py-0.5 rounded font-mono font-bold text-brand-primary">superadmin@watchtower.dev</code> to manage clients.
              </div>
              <div>
                &bull; <strong className="text-txt-primary">Client Admin:</strong> Super Admin creates clients and registers their Admin Email. Use your registered email and password to log in directly.
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-txt-tertiary">
            All activity on this console is recorded in the immutable audit log.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
