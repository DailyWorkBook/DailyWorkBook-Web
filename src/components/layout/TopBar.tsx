import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, ChevronDown, ShieldCheck, LogOut, Settings, X, AlertTriangle, CheckCircle2, Clock, Radio, Command } from 'lucide-react';
import { useTheme } from '../../core/theme';
import { useAuth } from '../../core/auth';
import { navItems } from './Sidebar';
import { Sheet } from '../ui/Sheet';

// Notification mock data
const NOTIFICATIONS = [
  { id: 'n1', type: 'exception', text: 'Ramesh Kumar check-in is outside geofence by 480m', time: '2 min ago', read: false },
  { id: 'n2', type: 'leave', text: 'Sunil Jadhav leave request pending approval', time: '18 min ago', read: false },
  { id: 'n3', type: 'alert', text: 'Site HDFC FC Road: 2 guards not yet checked in', time: '45 min ago', read: false },
  { id: 'n4', type: 'success', text: 'August roster published successfully for 12 posts', time: '1 hr ago', read: true },
  { id: 'n5', type: 'alert', text: 'Shift conflict detected: G-Post-4 overlap on Tue 19', time: '3 hr ago', read: true },
];

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  const getCurrentPageLabel = () => {
    const currentNav = navItems.find(n =>
      n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)
    );
    return currentNav?.label || 'Dashboard';
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'exception': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'leave': return <Clock className="w-4 h-4 text-brand-primary" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-brand-teal" />;
      default: return <AlertTriangle className="w-4 h-4 text-status-absent" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 glass-topbar px-5 md:px-8 flex items-center justify-between border-b border-border shadow-xs">
        {/* Left: Mobile Hamburger + Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-txt-secondary hover:text-txt-primary rounded-xl hover:bg-bg-surface-2 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-3">
            <div>
              <h2 className="text-base font-extrabold text-txt-primary tracking-tight leading-tight">{getCurrentPageLabel()}</h2>
              <span className="text-[11px] text-txt-tertiary font-medium">WatchTower Security Command System</span>
            </div>

            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-teal/10 text-brand-teal border border-brand-teal/20 ml-2">
              <Radio className="w-3 h-3 text-brand-teal animate-pulse" />
              Live Operations Active
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Command Search Box */}
          <div className="relative hidden sm:block w-52 lg:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-tertiary" />
            <input
              type="text"
              placeholder="Search guards, sites, posts..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-1.5 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all font-medium"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-bg-surface text-[10px] font-mono text-txt-tertiary border border-border">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 text-txt-secondary hover:text-txt-primary rounded-xl hover:bg-bg-surface-2 transition-colors border border-border/50"
          >
            {theme === 'light'
              ? <Moon className="w-4 h-4" />
              : <Sun className="w-4 h-4 text-amber-400" />
            }
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setIsNotifOpen(p => !p); setIsProfileOpen(false); }}
              className="relative p-2 text-txt-secondary hover:text-txt-primary rounded-xl hover:bg-bg-surface-2 transition-colors border border-border/50"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 ring-2 ring-bg-surface shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-84 wt-card p-0 overflow-hidden shadow-2xl z-50 border border-border"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between bg-bg-surface-2">
                    <div>
                      <h4 className="text-sm font-bold text-txt-primary">Security Telemetry Alerts</h4>
                      <p className="text-[11px] text-txt-secondary">{unreadCount} urgent items requiring action</p>
                    </div>
                    <button onClick={() => setIsNotifOpen(false)} className="p-1 text-txt-tertiary hover:text-txt-primary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-bg-surface-2 cursor-pointer transition-colors ${!n.read ? 'bg-brand-primary-050/40' : ''}`}>
                        <div className="mt-0.5 flex-shrink-0">{getNotifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-txt-primary font-bold leading-snug">{n.text}</p>
                          <p className="text-[11px] text-txt-tertiary mt-0.5 font-mono">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border text-center bg-bg-surface-2">
                    <button onClick={() => { setIsNotifOpen(false); navigate('/exceptions'); }} className="text-xs font-bold text-brand-primary hover:underline">
                      View All Exception Audit Logs →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar / Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setIsProfileOpen(p => !p); setIsNotifOpen(false); }}
              className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-xl hover:bg-bg-surface-2 transition-colors border border-border/50"
            >
              <img
                src={user?.avatarUrl || 'https://i.pravatar.cc/150?u=admin'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-primary/30 flex-shrink-0"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-extrabold text-txt-primary leading-tight">{user?.name || 'Admin User'}</div>
                <div className="text-[10px] text-txt-tertiary font-medium">{user?.role || 'Organization Admin'}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-txt-tertiary transition-transform hidden lg:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 wt-card p-2 shadow-2xl z-50 overflow-hidden border border-border"
                >
                  <div className="px-3 py-2.5 border-b border-border mb-1 bg-bg-surface-2 rounded-lg">
                    <div className="text-xs font-extrabold text-txt-primary">{user?.name}</div>
                    <div className="text-[11px] text-txt-secondary font-mono truncate">{user?.email}</div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-050 text-brand-primary mt-1 border border-brand-primary/20">
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2 rounded-btn transition-colors"
                  >
                    <Settings className="w-4 h-4 text-brand-primary" />
                    Account & System Settings
                  </Link>
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-status-absent hover:bg-status-absent/10 rounded-btn transition-colors mt-0.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Sheet isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="WatchTower Console" side="left">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 p-3 mb-4 bg-gradient-to-r from-brand-primary-050 to-brand-teal-050 border border-brand-primary/20 text-brand-primary rounded-xl">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            <div>
              <div className="font-extrabold text-sm text-txt-primary">WatchTower</div>
              <div className="text-xs text-txt-secondary">Security Operations Console</div>
            </div>
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                  active
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
                }`}
              >
                <Icon className="w-4.5 h-4.5 stroke-[1.75]" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-border">
            <Link
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2"
            >
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </Link>
            <button
              onClick={() => { setIsMobileMenuOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-status-absent hover:bg-status-absent/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
};
