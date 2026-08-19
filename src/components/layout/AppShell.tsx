import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../../core/auth';
import { PasswordChangeGate } from './PasswordChangeGate';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg-app text-txt-primary flex flex-col md:flex-row transition-colors">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((open) => !open)} />

      <div
        className={`flex-1 ${collapsed ? 'md:pl-[74px]' : 'md:pl-[250px]'} flex flex-col min-w-0 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]`}
      >
        <TopBar />
        <main className="flex-1 p-5 md:p-8 max-w-[1700px] w-full mx-auto">
          {/* An account whose password was set by someone else must replace it
              before it is genuinely theirs — so the gate blocks everything. */}
          {user?.mustChangePassword ? <PasswordChangeGate /> : children}
        </main>
      </div>
    </div>
  );
};
