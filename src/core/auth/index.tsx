import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  authApi,
  setSessionExpiredHandler,
  tokenStore,
  type ImpersonationBadge,
  type SessionUser,
} from '../../services';

/**
 * Session state for the whole app.
 *
 * The user object is re-read from `/auth/me` on every load rather than trusted
 * from storage, so a revoked account or a changed role takes effect on the next
 * page load instead of persisting in a stale copy.
 */

export interface AuthContextValue {
  user: SessionUser | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Set while a Super Admin is signed in as this account. */
  impersonation: ImpersonationBadge | null;
  isImpersonating: boolean;
  /**
   * Spends a bypass ticket and adopts the resulting session *for this tab only*,
   * which is what keeps the operator signed in as themselves everywhere else.
   */
  beginImpersonation: (ticket: string) => Promise<SessionUser>;
  /** Hands the account back and closes this tab's session. */
  endImpersonation: () => Promise<void>;
  /** True when the workspace owns the module. Platform operators own none. */
  hasModule: (moduleCode: string) => boolean;
  /** True when the signed-in role grants the permission. */
  can: (permissionCode: string) => boolean;
  canAny: (permissionCodes: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  // With no token there is nothing to restore, so the app can render the login
  // screen immediately rather than flashing a loading state first.
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'anonymous'>(() =>
    tokenStore.getAccess() ? 'loading' : 'anonymous',
  );

  const signOutLocally = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  // The API client calls this when a refresh fails and the session is gone.
  useEffect(() => {
    setSessionExpiredHandler(signOutLocally);
  }, [signOutLocally]);

  /**
   * Re-reads the account from the server. Every state update happens after the
   * request settles, so this is a subscription to an external system rather
   * than a synchronous cascade — which is exactly what an effect is for.
   */
  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.isAuthError) {
        signOutLocally();
        return;
      }
      // A transient network problem should not throw the user out; keep the
      // session and let the individual screens surface their own error state.
      setStatus(tokenStore.getAccess() ? 'authenticated' : 'anonymous');
    }
  }, [signOutLocally]);

  useEffect(() => {
    if (!tokenStore.getAccess()) return;
    // Restoring a session is a genuine external-system read: the stored token is
    // exchanged with the server and the result becomes state. Every update here
    // happens after that request settles, so there is no synchronous cascade —
    // the lint rule cannot see through the async boundary to tell.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUser();
  }, [refreshUser]);

  const beginImpersonation = useCallback(async (ticket: string) => {
    const session = await authApi.redeemImpersonation(ticket);
    tokenStore.setTabScoped(session.accessToken, session.refreshToken);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const endImpersonation = useCallback(async () => {
    try {
      await authApi.exitImpersonation();
    } catch {
      // The session is being abandoned either way; a failed call here must not
      // strand the operator in a workspace they can no longer leave.
    }
    signOutLocally();
  }, [signOutLocally]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authApi.login(email, password);
    tokenStore.set(session.accessToken, session.refreshToken);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Signing out locally must succeed even if the server call does not.
    }
    signOutLocally();
  }, [signOutLocally]);

  const value = useMemo<AuthContextValue>(() => {
    const modules = new Set(user?.modules ?? []);
    const permissions = new Set(user?.permissions ?? []);

    return {
      user,
      status,
      isAuthenticated: status === 'authenticated' && user !== null,
      isSuperAdmin: user?.actorType === 'SUPER_ADMIN',
      impersonation: user?.impersonation ?? null,
      isImpersonating: Boolean(user?.impersonation),
      login,
      logout,
      refreshUser,
      beginImpersonation,
      endImpersonation,
      hasModule: (moduleCode: string) => modules.has(moduleCode),
      can: (permissionCode: string) => permissions.has(permissionCode),
      canAny: (permissionCodes: string[]) => permissionCodes.some((code) => permissions.has(code)),
    };
  }, [user, status, login, logout, refreshUser, beginImpersonation, endImpersonation]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
