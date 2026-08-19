import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Crown, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../core/auth';
import {
  PLATFORM_NAV,
  PLATFORM_SECTIONS,
  WORKSPACE_NAV,
  WORKSPACE_SECTIONS,
  type NavDestination,
} from '../../core/navigation';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, isSuperAdmin, hasModule, can, logout } = useAuth();

  /**
   * The menu is derived from what this account can actually reach. A module the
   * client never bought, or a permission the role does not hold, produces no
   * link — and the route and the API refuse it independently.
   */
  const { destinations, sections } = useMemo(() => {
    if (isSuperAdmin) {
      return { destinations: PLATFORM_NAV, sections: [...PLATFORM_SECTIONS] as string[] };
    }
    const visible = WORKSPACE_NAV.filter((item) => hasModule(item.module) && can(item.permission));
    const usedSections = WORKSPACE_SECTIONS.filter((section) => visible.some((item) => item.section === section));
    return { destinations: visible, sections: [...usedSections] as string[] };
  }, [isSuperAdmin, hasModule, can]);

  const canOpenSettings = !isSuperAdmin && hasModule('ACCESS_CONTROL') && can('SETTINGS_VIEW');
  const width = collapsed ? '74px' : '250px';

  const renderLink = (item: NavDestination) => {
    const Icon = item.icon;
    return (
      <div key={item.path} className="relative group">
        <NavLink
          to={item.path}
          end={item.path === '/platform'}
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
              isActive
                ? isSuperAdmin
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-600/30 ring-1 ring-white/20'
                  : 'bg-gradient-to-r from-brand-primary to-brand-primary-600 text-white font-bold shadow-md shadow-brand-primary/30 ring-1 ring-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
            } ${collapsed ? 'justify-center' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-white rounded-r-full shadow-sm" aria-hidden />
              )}
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <Icon className="w-4 h-4" strokeWidth={1.8} aria-hidden />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="text-[12.5px] tracking-tight flex-1 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </NavLink>
        {collapsed && <div className="sidebar-tooltip group-hover:opacity-100">{item.label}</div>}
      </div>
    );
  };

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ width }}
      className="fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col wt-sidebar overflow-hidden shadow-2xl border-r border-sidebar-border"
      aria-label="Main navigation"
    >
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-sidebar-border/80 bg-gradient-to-r from-sidebar-bg via-sidebar-bg to-brand-primary/10 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/10 ${
            isSuperAdmin
              ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-600/40'
              : 'bg-gradient-to-br from-brand-primary to-brand-teal shadow-brand-primary/40'
          }`}
        >
          {isSuperAdmin ? (
            <Crown className="w-5 h-5 text-white" strokeWidth={2} aria-hidden />
          ) : (
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} aria-hidden />
          )}
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="min-w-0 flex-1"
            >
              <div className="text-sm font-extrabold text-white tracking-tight leading-none truncate">
                {isSuperAdmin ? 'WatchTower HQ' : user?.clientName ?? 'WatchTower'}
              </div>
              <div className="text-[11px] text-white/50 font-medium leading-tight mt-0.5 truncate">
                {isSuperAdmin ? 'Platform console' : 'Security operations'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-none">
        {sections.map((section) => {
          const items = destinations.filter((item) => item.section === section);
          if (items.length === 0) return null;

          return (
            <div key={section} className="space-y-1">
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 mb-1.5 flex items-center justify-between"
                  >
                    <span className="text-[10px] font-bold text-white/35 tracking-widest uppercase font-mono">{section}</span>
                    <div className="h-px flex-1 ml-3 bg-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>
              {items.map(renderLink)}
            </div>
          );
        })}

        {destinations.length === 0 && !collapsed && (
          <p className="px-3 py-6 text-[11px] text-white/40 leading-relaxed">
            No sections are available to your role yet. A workspace administrator can grant you access.
          </p>
        )}
      </nav>

      <div className="border-t border-sidebar-border/80 px-3 py-2.5 space-y-1 bg-sidebar-bg/80 backdrop-blur-md">
        {canOpenSettings && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-white/10 text-white font-bold ring-1 ring-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Settings className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} aria-hidden />
            {!collapsed && <span className="text-[12.5px]">Settings</span>}
          </NavLink>
        )}

        <div className={`flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white/5 border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0 w-8 h-8">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-primary/40 block"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 ring-2 ring-brand-primary/40 flex items-center justify-center text-[11px] font-bold text-white">
                {initialsOf(user?.name ?? '?')}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-sidebar-bg" aria-hidden />
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-white leading-tight truncate">{user?.name}</div>
                <div className="text-[10px] text-white/40 truncate mt-0.5">{user?.roleName ?? user?.email}</div>
              </div>
              <button
                onClick={() => void logout()}
                title="Sign out"
                aria-label="Sign out"
                className="text-white/40 hover:text-status-absent transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        className="absolute -right-3.5 top-16 w-7 h-7 rounded-full bg-bg-surface border border-border shadow-lg flex items-center justify-center text-txt-secondary hover:text-brand-primary hover:border-brand-primary transition-all z-50 hover:scale-110"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" aria-hidden /> : <ChevronLeft className="w-4 h-4" aria-hidden />}
      </button>
    </motion.aside>
  );
};

export { WORKSPACE_NAV, PLATFORM_NAV };
