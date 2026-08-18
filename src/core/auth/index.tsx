import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../../services/authApi';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  roleCode?: string;
  tenantId?: string;
  tenantName?: string;
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
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  startBypassSession: (targetAdmin: { name: string; email: string; clientName: string; clientId: string; adminId: string }, reason: string, openNewTab?: boolean) => void;
  exitBypassSession: () => void;
}

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
      return {
        name: initialImpersonation.adminName,
        email: initialImpersonation.adminEmail,
        role: `Client Admin (${initialImpersonation.clientName})`,
        roleCode: 'ORG_ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    const res = await authApi.login(email, pass);
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    if (res.user) {
      saveUser(res.user);
      return true;
    }
    throw new Error('Invalid login response from server');
  };

  const logout = () => {
    saveUser(null);
    setImpersonatedSession(null);
    sessionStorage.removeItem(IMPERSONATE_KEY);
    localStorage.removeItem('token');
  };

  const startBypassSession = (
    targetAdmin: { name: string; email: string; clientName: string; clientId: string; adminId: string },
    reason: string,
    openNewTab: boolean = true
  ) => {
    const sessionId = 'bpl-' + Date.now();
    const sessionObj: ImpersonatedSession = {
      adminName: targetAdmin.name,
      adminEmail: targetAdmin.email,
      clientName: targetAdmin.clientName,
      clientId: targetAdmin.clientId,
      reason,
      bypassLogId: sessionId,
      startTime: new Date().toLocaleString()
    };

    if (openNewTab) {
      const params = new URLSearchParams({
        bypassSessionId: sessionId,
        adminName: targetAdmin.name,
        adminEmail: targetAdmin.email,
        clientName: targetAdmin.clientName,
        clientId: targetAdmin.clientId,
        reason
      });
      const newTabUrl = `${window.location.origin}/?${params.toString()}`;
      window.open(newTabUrl, '_blank');
      return;
    }

    sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify(sessionObj));
    setImpersonatedSession(sessionObj);
    saveUser({
      name: targetAdmin.name,
      email: targetAdmin.email,
      role: `Client Admin (${targetAdmin.clientName})`,
      roleCode: 'ORG_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    });
  };

  const exitBypassSession = () => {
    setImpersonatedSession(null);
    sessionStorage.removeItem(IMPERSONATE_KEY);
    saveUser({
      name: 'Alex Morgan',
      email: 'superadmin@watchtower.dev',
      role: 'Super Administrator',
      roleCode: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isImpersonating: !!impersonatedSession,
        impersonatedSession,
        login,
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
