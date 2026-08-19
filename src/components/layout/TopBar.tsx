import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, LogOut, Menu, Moon, Settings, Sun, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../core/theme';
import { useAuth } from '../../core/auth';
import { PLATFORM_NAV, WORKSPACE_NAV } from '../../core/navigation';
import { queryKeys } from '../../core/query';
import { dashboardApi } from '../../services';
import { Sheet } from '../ui/Sheet';

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isSuperAdmin, hasModule, can, logout } = useAuth();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isAlertsOpen, setAlertsOpen] = useState(false);

  const destinations = useMemo(() => {
    if (isSuperAdmin) return PLATFORM_NAV;
    return WORKSPACE_NAV.filter((item) => hasModule(item.module) && can(item.permission));
  }, [isSuperAdmin, hasModule, can]);

  const currentLabel =
    destinations.find((item) =>
      item.path === '/dashboard' || item.path === '/platform'
        ? location.pathname === item.path
        : location.pathname.startsWith(item.path),
    )?.label ?? (isSuperAdmin ? 'Platform console' : 'Workspace');

  /**
   * The alert count is the two real work queues — pending exceptions and
   * pending leave — read from the API. There is no notification feed to invent.
   */
  const canSeeQueues = !isSuperAdmin && hasModule('DASHBOARD') && can('DASHBOARD_VIEW');
  const { data: overview } = useQuery({
    queryKey: queryKeys.dashboard(undefined),
    queryFn: () => dashboardApi.overview(),
    enabled: canSeeQueues,
    staleTime: 30_000,
  });

  const pendingExceptions = overview?.queues.pendingExceptions ?? 0;
  const pendingLeave = overview?.queues.pendingLeave ?? 0;
  const outstanding = pendingExceptions + pendingLeave;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 glass-topbar px-5 md:px-8 flex items-center justify-between border-b border-border shadow-xs">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="md:hidden p-2 text-txt-secondary hover:text-txt-primary rounded-xl hover:bg-bg-surface-2 transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-txt-primary tracking-tight truncate">{currentLabel}</h1>
            <p className="text-[11px] text-txt-secondary truncate">
              {isSuperAdmin ? 'WatchTower platform' : user?.clientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            className="p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" aria-hidden /> : <Sun className="w-4 h-4" aria-hidden />}
          </button>

          {canSeeQueues && (
            <div className="relative">
              <button
                onClick={() => setAlertsOpen((open) => !open)}
                aria-label={`Work queues, ${outstanding} item${outstanding === 1 ? '' : 's'} awaiting action`}
                className="relative p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2 transition-colors"
              >
                <Bell className="w-4 h-4" aria-hidden />
                {outstanding > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-status-absent text-white text-[9px] font-bold flex items-center justify-center">
                    {outstanding > 99 ? '99+' : outstanding}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isAlertsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-72 bg-bg-surface border border-border rounded-2xl shadow-xl p-2 z-50"
                  >
                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-txt-tertiary font-mono">
                      Awaiting action
                    </div>

                    {outstanding === 0 ? (
                      <p className="px-2 py-4 text-xs text-txt-secondary text-center">
                        Nothing is waiting on you right now.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {pendingExceptions > 0 && can('EXCEPTION_VIEW') && (
                          <button
                            onClick={() => {
                              setAlertsOpen(false);
                              navigate('/exceptions');
                            }}
                            className="w-full text-left px-2 py-2 rounded-xl hover:bg-bg-surface-2 transition-colors text-xs"
                          >
                            <span className="font-bold text-txt-primary">{pendingExceptions}</span>{' '}
                            <span className="text-txt-secondary">
                              attendance exception{pendingExceptions === 1 ? '' : 's'} to review
                            </span>
                          </button>
                        )}
                        {pendingLeave > 0 && can('LEAVE_VIEW') && (
                          <button
                            onClick={() => {
                              setAlertsOpen(false);
                              navigate('/leave');
                            }}
                            className="w-full text-left px-2 py-2 rounded-xl hover:bg-bg-surface-2 transition-colors text-xs"
                          >
                            <span className="font-bold text-txt-primary">{pendingLeave}</span>{' '}
                            <span className="text-txt-secondary">leave request{pendingLeave === 1 ? '' : 's'} to decide</span>
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-bg-surface-2 transition-colors"
              aria-label="Account menu"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" loading="lazy" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-brand-primary/15 text-brand-primary text-[11px] font-bold flex items-center justify-center">
                  {initialsOf(user?.name ?? '?')}
                </span>
              )}
              <span className="hidden lg:block text-xs font-semibold text-txt-primary max-w-[10rem] truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-txt-tertiary hidden lg:block" aria-hidden />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-60 bg-bg-surface border border-border rounded-2xl shadow-xl p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-border/70">
                    <div className="text-xs font-bold text-txt-primary truncate">{user?.name}</div>
                    <div className="text-[11px] text-txt-secondary truncate">{user?.email}</div>
                    <div className="text-[10px] text-txt-tertiary mt-1 font-mono uppercase tracking-wide">
                      {user?.roleName ?? user?.roleCode}
                    </div>
                  </div>

                  {!isSuperAdmin && hasModule('ACCESS_CONTROL') && can('SETTINGS_VIEW') && (
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" aria-hidden /> Settings
                    </Link>
                  )}

                  <button
                    onClick={() => void logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-status-absent hover:bg-status-absent/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <Sheet isOpen={isMobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left">
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-txt-primary truncate">
                {isSuperAdmin ? 'WatchTower HQ' : user?.clientName}
              </div>
              <div className="text-[11px] text-txt-secondary truncate">{user?.email}</div>
            </div>
            <button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="p-1.5 rounded-lg hover:bg-bg-surface-2">
              <X className="w-4 h-4 text-txt-secondary" aria-hidden />
            </button>
          </div>

          {destinations.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2 transition-colors min-h-[44px]"
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} aria-hidden />
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-status-absent hover:bg-status-absent/10 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" aria-hidden /> Sign out
          </button>
        </div>
      </Sheet>
    </>
  );
};
