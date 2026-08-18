import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  roleCode?: string;
}

export interface ImpersonatedSession {
  adminName: string;
  adminEmail: string;
  clientName: string;
  clientId: string;
  reason: string;
  bypassLogId: string;
  startTime: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  impersonatedSession: ImpersonatedSession | null;
  login: (email: string, pass: string) => boolean;
  quickLogin: (userType: 'superadmin' | 'admin' | 'manager' | 'supervisor') => void;
  logout: () => void;
  startBypassSession: (targetAdmin: { name: string; email: string; clientName: string; clientId: string; adminId: string }, reason: string, openNewTab?: boolean) => void;
  exitBypassSession: () => void;
}

export const DEMO_USERS: Record<string, User> = {
  superadmin: {
    name: 'Alex Morgan',
    email: 'superadmin@watchtower.dev',
    role: 'Super Administrator',
    roleCode: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  admin: {
    name: 'Olivia Chen',
    email: 'admin@watchtower.dev',
    role: 'Organization Admin',
    roleCode: 'ORG_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  manager: {
    name: 'Vikramaditya Rao',
    email: 'manager@watchtower.dev',
    role: 'Regional Operations Manager',
    roleCode: 'REGIONAL_MGR',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  supervisor: {
    name: 'Priya Sharma',
    email: 'supervisor@watchtower.dev',
    role: 'Field Attendance Supervisor',
    roleCode: 'SITE_SUPERVISOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  }
};

const STORAGE_KEY = 'wt_session_v2';
const IMPERSONATE_KEY = 'wt_impersonate_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check URL search params for new tab impersonation launch
  const urlParams = new URLSearchParams(window.location.search);
  const bypassSessionId = urlParams.get('bypassSessionId');
  const targetAdminName = urlParams.get('adminName');
  const targetAdminEmail = urlParams.get('adminEmail');
  const targetClientName = urlParams.get('clientName');
  const targetClientId = urlParams.get('clientId');
  const bypassReason = urlParams.get('reason');

  const initialImpersonation: ImpersonatedSession | null = bypassSessionId
    ? {
        adminName: targetAdminName || 'Client Admin',
        adminEmail: targetAdminEmail || 'admin@client.com',
        clientName: targetClientName || 'Client Organization',
        clientId: targetClientId || 'client-1',
        reason: bypassReason || 'Super Admin Troubleshooting',
        bypassLogId: bypassSessionId,
        startTime: new Date().toLocaleString()
      }
    : null;

  const [impersonatedSession, setImpersonatedSession] = useState<ImpersonatedSession | null>(() => {
    if (initialImpersonation) {
      sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify(initialImpersonation));
      return initialImpersonation;
    }
    try {
      const saved = sessionStorage.getItem(IMPERSONATE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    if (initialImpersonation) {
      const impersonatedUser: User = {
        name: initialImpersonation.adminName,
        email: initialImpersonation.adminEmail,
        role: `Client Admin (${initialImpersonation.clientName})`,
        roleCode: 'CLIENT_ADMIN',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(initialImpersonation.adminName)}&background=0D8ABC&color=fff`
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(impersonatedUser));
      return impersonatedUser;
    }
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setAndStoreUser = (u: User | null) => {
    setUser(u);
    if (u) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const setAndStoreImpersonation = (session: ImpersonatedSession | null) => {
    setImpersonatedSession(session);
    if (session) {
      sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(IMPERSONATE_KEY);
    }
  };

  const login = (email: string, _pass: string): boolean => {
    if (!email) return false;
    let loggedUser = DEMO_USERS.admin;
    if (email.includes('superadmin')) loggedUser = DEMO_USERS.superadmin;
    else if (email.includes('manager')) loggedUser = DEMO_USERS.manager;
    else if (email.includes('supervisor')) loggedUser = DEMO_USERS.supervisor;
    setAndStoreUser(loggedUser);
    return true;
  };

  const quickLogin = (userType: 'superadmin' | 'admin' | 'manager' | 'supervisor') => {
    const loggedUser = DEMO_USERS[userType] || DEMO_USERS.admin;
    setAndStoreUser(loggedUser);
  };

  const logout = () => {
    setAndStoreUser(null);
    setAndStoreImpersonation(null);
  };

  const startBypassSession = (
    targetAdmin: { name: string; email: string; clientName: string; clientId: string; adminId: string },
    reason: string,
    openNewTab: boolean = true
  ) => {
    const sessionId = 'bpl-' + Date.now();
    const session: ImpersonatedSession = {
      adminName: targetAdmin.name,
      adminEmail: targetAdmin.email,
      clientName: targetAdmin.clientName,
      clientId: targetAdmin.clientId,
      reason,
      bypassLogId: sessionId,
      startTime: new Date().toLocaleString()
    };

    if (openNewTab) {
      // Build parameters URL for new tab
      const searchParams = new URLSearchParams({
        bypassSessionId: sessionId,
        adminName: targetAdmin.name,
        adminEmail: targetAdmin.email,
        clientName: targetAdmin.clientName,
        clientId: targetAdmin.clientId,
        reason: reason
      });
      const newTabUrl = `${window.location.origin}/?${searchParams.toString()}`;
      window.open(newTabUrl, '_blank');
    } else {
      setAndStoreImpersonation(session);
      setAndStoreUser({
        name: targetAdmin.name,
        email: targetAdmin.email,
        role: `Client Admin (${targetAdmin.clientName})`,
        roleCode: 'CLIENT_ADMIN',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(targetAdmin.name)}&background=0D8ABC&color=fff`
      });
    }
  };

  const exitBypassSession = () => {
    setAndStoreImpersonation(null);
    // Restore Super Admin user account
    setAndStoreUser(DEMO_USERS.superadmin);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isImpersonating: !!impersonatedSession,
        impersonatedSession,
        login,
        quickLogin,
        logout,
        startBypassSession,
        exitBypassSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
