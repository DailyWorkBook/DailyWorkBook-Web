import React, { createContext, useContext, useState } from 'react';

export interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  roleCode?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  quickLogin: (userType: 'admin' | 'manager' | 'supervisor') => void;
  logout: () => void;
}

export const DEMO_USERS: Record<string, User> = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY); // Session-only — clears on tab/window close
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setAndStore = (u: User | null) => {
    setUser(u);
    if (u) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = (email: string, _pass: string): boolean => {
    if (!email) return false;
    let loggedUser = DEMO_USERS.admin;
    if (email.includes('manager')) loggedUser = DEMO_USERS.manager;
    else if (email.includes('supervisor')) loggedUser = DEMO_USERS.supervisor;
    setAndStore(loggedUser);
    return true;
  };

  const quickLogin = (userType: 'admin' | 'manager' | 'supervisor') => {
    const loggedUser = DEMO_USERS[userType] || DEMO_USERS.admin;
    setAndStore(loggedUser);
  };

  const logout = () => setAndStore(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
