import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../../core/auth';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isImpersonating, impersonatedSession, exitBypassSession } = useAuth();
  const navigate = useNavigate();

  const handleExit = () => {
    exitBypassSession();
    navigate('/superadmin');
  };

  return (
    <div className="min-h-screen bg-bg-app text-txt-primary flex flex-col md:flex-row transition-colors">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      {/* Main content area — expands smoothly when sidebar collapses */}
      <div
        className={`flex-1 ${
          collapsed ? 'md:pl-[74px]' : 'md:pl-[250px]'
        } flex flex-col min-w-0 transition-all duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        id="main-content-area"
      >
        {/* Sticky Impersonation Bypass Banner */}
        {isImpersonating && impersonatedSession && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2.5 shadow-lg border-b border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 font-semibold">
              <span className="p-1 bg-slate-950/10 rounded-md">
                <ShieldAlert className="w-4 h-4 text-slate-950 animate-pulse" />
              </span>
              <span>
                <strong className="font-extrabold tracking-wider uppercase font-mono">
                  SUPER ADMIN BYPASS SESSION ACTIVE:
                </strong>{' '}
                Currently impersonating{' '}
                <span className="font-bold underline decoration-slate-950/40">
                  {impersonatedSession.adminName}
                </span>{' '}
                ({impersonatedSession.clientName})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] opacity-85 font-mono hidden lg:inline">
                Reason: &ldquo;{impersonatedSession.reason}&rdquo;
              </span>
              <button
                onClick={handleExit}
                className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Admin Session
              </button>
            </div>
          </div>
        )}

        <TopBar />
        <main className="flex-1 p-5 md:p-8 max-w-[1700px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
