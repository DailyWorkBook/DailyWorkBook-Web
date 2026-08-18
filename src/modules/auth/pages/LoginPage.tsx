import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff,
  CheckCircle2, UserCheck, Sparkles, Building2, Users, MapPin
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../../core/auth';

const FEATURES = [
  'Automated geofence check-in classification',
  'Live shift conflict detection & roster guard',
  'Dual-control exception approval workflow',
  'Audit log with immutable compliance trail',
  'Role-based access control (RBAC) engine',
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickLogin, isAuthenticated } = useAuth();

  const [demoRole, setDemoRole] = useState<'admin' | 'manager' | 'supervisor'>('admin');
  const [email, setEmail] = useState(DEMO_USERS.admin.email);
  const [password, setPassword] = useState('Admin@123');
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
    const t = setInterval(() => setFeatIdx(i => (i + 1) % FEATURES.length), 2800);
    return () => clearInterval(t);
  }, []);

  const handleRoleSelect = (role: 'admin' | 'manager' | 'supervisor') => {
    setDemoRole(role);
    setEmail(DEMO_USERS[role].email);
    setPassword('Admin@123');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (success) navigate('/');
      else setError('Invalid credentials. Use one of the demo accounts below.');
    }, 500);
  };

  const handleQuickLogin = (role: 'admin' | 'manager' | 'supervisor') => {
    quickLogin(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-bg-app flex flex-col md:flex-row selection:bg-brand-primary/20">
      {/* ── LEFT: Dark Brand Hero ── */}
      <div className="md:w-[52%] relative flex flex-col justify-between p-8 lg:p-14 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1120 0%, #0E1B34 50%, #0F2050 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #2F6BFF 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[360px] h-[360px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #12B5A5 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #2F6BFF, #12B5A5)' }}>
              <ShieldCheck className="w-6 h-6 text-white stroke-[2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">WatchTower</h1>
              <p className="text-[11px] text-white/50">Workforce Attendance Console</p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold border border-white/10 text-white/60">
            Enterprise v2.4
          </span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 mt-16 mb-10">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/70">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>GUARD ATTENDANCE WEB SYSTEM</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Realtime Guard<br />Attendance &<br />
            <span style={{ background: 'linear-gradient(90deg, #60A5FA, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Roster Control.
            </span>
          </h2>

          <p className="text-sm text-white/60 mt-5 max-w-md leading-relaxed">
            Monitor check-ins across all deployed site posts, process geofence exceptions, manage shift rosters, and enforce compliance — all in one console.
          </p>

          {/* Feature carousel */}
          <div className="mt-8 h-8 overflow-hidden relative">
            <motion.div
              key={featIdx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center gap-2 text-sm text-white/80 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
              {FEATURES[featIdx]}
            </motion.div>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mb-12">
          {[
            { icon: Users, label: 'Active Guards', value: '452' },
            { icon: Building2, label: 'Client Sites', value: '24' },
            { icon: MapPin, label: 'Geofence Posts', value: '87' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-2xl border border-white/10 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
              <Icon className="w-4 h-4 text-white/40 mx-auto mb-1" />
              <div className="text-xl font-extrabold text-white tabular-nums">{value}</div>
              <div className="text-[11px] text-white/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-xs text-white/30 border-t border-white/10 pt-4">
          &copy; 2026 WatchTower Systems — All administrative actions are audit-logged.
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className="md:w-[48%] flex items-center justify-center p-6 md:p-12 bg-bg-app">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-txt-primary">Sign in to Console</h3>
            <p className="text-sm text-txt-secondary mt-1">Select a demo role or enter your credentials</p>
          </div>

          {/* Demo Role Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-2">Demo Account</label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'manager', 'supervisor'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center capitalize ${
                    demoRole === role
                      ? 'border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                      : 'border-border bg-bg-surface text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
                  }`}
                >
                  {role === 'admin' ? '🛡️ Admin' : role === 'manager' ? '📋 Manager' : '👤 Supervisor'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-txt-tertiary mt-2">
              {DEMO_USERS[demoRole].name} · {DEMO_USERS[demoRole].role}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-status-absent/10 border border-status-absent/20 text-status-absent text-xs font-semibold rounded-xl">
              {error}
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
                  onChange={e => setEmail(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-bg-surface border border-border rounded-btn text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-tertiary hover:text-txt-primary transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-txt-secondary cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-brand-primary" />
                Remember me
              </label>
              <button type="button" className="text-brand-primary font-semibold hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-600 active:bg-brand-primary-700 text-white text-sm font-bold rounded-btn shadow-lg shadow-brand-primary/30 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In to Console <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-txt-tertiary font-medium">or instant access</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* One-click demo logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-brand-primary/30 bg-brand-primary/8 text-brand-primary text-xs font-bold hover:bg-brand-primary/15 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Admin Login
            </button>
            <button
              onClick={() => handleQuickLogin('manager')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-brand-teal/30 bg-brand-teal/8 text-brand-teal text-xs font-bold hover:bg-brand-teal/15 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Manager Login
            </button>
          </div>

          <p className="mt-6 text-center text-[11px] text-txt-tertiary">
            All activity on this console is recorded in the immutable audit log.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
