import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck,
  AlertTriangle,
  Building2,
  Users,
  CalendarDays,
  FileSpreadsheet,
  BarChart3,
  KeyRound,
  Settings,
  LogOut,
  ShieldCheck,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  Crown,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../core/auth';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  section?: string;
}

// Super Admin Navigation (Exactly 3 Main Tabs)
export const superAdminNavItems: NavItem[] = [
  { label: 'Super Admin Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard, section: 'SUPER ADMIN' },
  { label: 'Client Management', path: '/superadmin/clients', icon: Building2, section: 'SUPER ADMIN' },
  { label: 'Super Admin Control', path: '/superadmin/control', icon: ShieldAlert, section: 'SUPER ADMIN' },
];

// Operational Client Admin / Manager / Supervisor Navigation
export const operationalNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, section: 'OVERVIEW' },
  { label: 'Attendance Register', path: '/attendance', icon: CalendarCheck, section: 'OVERVIEW' },
  { label: 'Exceptions Queue', path: '/exceptions', icon: AlertTriangle, badge: 4, badgeColor: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30', section: 'OVERVIEW' },
  { label: 'Clients Directory', path: '/clients', icon: Briefcase, section: 'WORKFORCE' },
  { label: 'Sites & Posts', path: '/sites', icon: Building2, section: 'WORKFORCE' },
  { label: 'Employees Directory', path: '/employees', icon: Users, section: 'WORKFORCE' },
  { label: 'Shifts & Roster', path: '/roster', icon: CalendarDays, section: 'WORKFORCE' },
  { label: 'Leave Approvals', path: '/leave', icon: FileSpreadsheet, badge: 2, badgeColor: 'bg-brand-primary text-white shadow-sm shadow-brand-primary/30', section: 'WORKFORCE' },
  { label: 'Payroll Management', path: '/payroll', icon: DollarSign, section: 'FINANCIALS' },
  { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, section: 'FINANCIALS' },
  { label: 'Roles & Access', path: '/roles', icon: KeyRound, section: 'SYSTEM' },
  { label: 'System Audit Log', path: '/audit', icon: ClipboardList, section: 'SYSTEM' },
];

export const navItems = operationalNavItems;

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperAdmin = user?.roleCode === 'SUPER_ADMIN';

  const itemsToRender = isSuperAdmin ? superAdminNavItems : operationalNavItems;
  const sectionsToRender = isSuperAdmin
    ? ['SUPER ADMIN']
    : ['OVERVIEW', 'WORKFORCE', 'FINANCIALS', 'SYSTEM'];

  const isActive = (item: NavItem) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path);

  const sidebarWidth = collapsed ? '74px' : '250px';

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col wt-sidebar overflow-hidden shadow-2xl border-r border-sidebar-border"
      style={{ width: sidebarWidth }}
    >
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-sidebar-border/80 bg-gradient-to-r from-sidebar-bg via-sidebar-bg to-brand-primary/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/10 ${
          isSuperAdmin
            ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-600/40'
            : 'bg-gradient-to-br from-brand-primary to-brand-teal shadow-brand-primary/40'
        }`}>
          {isSuperAdmin ? (
            <Crown className="w-5 h-5 text-white stroke-[2]" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-white stroke-[2]" />
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
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-tight leading-none">
                  {isSuperAdmin ? 'WatchTower HQ' : 'WatchTower'}
                </span>
                <span className={`w-2 h-2 rounded-full animate-pulse ${isSuperAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              </div>
              <div className="text-[11px] text-white/50 font-medium leading-tight mt-0.5">
                {isSuperAdmin ? 'Super Admin Portal' : 'Security Command'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-none">
        {sectionsToRender.map(section => {
          const sectionItems = itemsToRender.filter(n => n.section === section);
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
                    <span className="text-[10px] font-bold text-white/35 tracking-widest uppercase font-mono">
                      {section}
                    </span>
                    <div className="h-[1px] flex-1 ml-3 bg-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>

              {sectionItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                  <div key={item.path} className="relative group">
                    <NavLink
                      to={item.path}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                        active
                          ? isSuperAdmin
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-600/30 ring-1 ring-white/20'
                            : 'bg-gradient-to-r from-brand-primary to-brand-primary-600 text-white font-bold shadow-md shadow-brand-primary/30 ring-1 ring-white/20'
                          : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-white rounded-r-full shadow-sm"
                        />
                      )}

                      <div className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${active ? 'text-white' : ''}`}>
                        <Icon className="w-4 h-4 stroke-[1.8]" />
                      </div>

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

                      {item.badge && !collapsed && (
                        <span className={`ml-auto flex-shrink-0 min-w-[18px] h-4.5 px-1.5 rounded-full ${item.badgeColor || 'bg-status-absent'} text-[10px] font-bold flex items-center justify-center`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>

                    {collapsed && (
                      <div className="sidebar-tooltip group-hover:opacity-100">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Settings & Logout Footer */}
      <div className="border-t border-sidebar-border/80 px-3 py-2.5 space-y-1 bg-sidebar-bg/80 backdrop-blur-md">
        {!isSuperAdmin && (
          <NavLink
            to="/settings"
            className={({ isActive: a }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 ${
                a ? 'bg-white/10 text-white font-bold ring-1 ring-white/10' : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Settings className="w-4 h-4 stroke-[1.8] flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12.5px]">
                  System Settings
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        )}

        <div className={`flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white/5 border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0 w-8 h-8">
            <img
              src={user?.avatarUrl || 'https://i.pravatar.cc/150?u=admin'}
              alt={user?.name || 'Admin'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-primary/40 block"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-sidebar-bg" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-white leading-tight truncate">{user?.name || 'Admin User'}</div>
                <div className="text-[10px] text-white/40 truncate mt-0.5">{user?.role || 'Organization Admin'}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button onClick={logout} title="Logout" className="text-white/40 hover:text-status-absent transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(p => !p)}
        className="absolute -right-3.5 top-16 w-7 h-7 rounded-full bg-bg-surface border border-border shadow-lg flex items-center justify-center text-txt-secondary hover:text-brand-primary hover:border-brand-primary transition-all z-50 hover:scale-110"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
};
