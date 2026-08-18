import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-app text-txt-primary flex flex-col md:flex-row transition-colors">
      <Sidebar />
      {/* Main content area — pushes right of sidebar (sidebar width animates via framer, so we use CSS var or fixed offset) */}
      <div className="flex-1 md:pl-[240px] flex flex-col min-w-0 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]" id="main-content-area">
        <TopBar />
        <main className="flex-1 p-5 md:p-8 max-w-[1700px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
