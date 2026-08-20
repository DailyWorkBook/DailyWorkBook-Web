/**
 * The single network boundary for the app.
 *
 * Everything the UI knows about the server goes through here: the access token
 * is attached, an expired one is refreshed once and the original request
 * retried, and every failure arrives as a typed `ApiError` the screens can
 * branch on instead of a bare string.
 */

const API_BASE_URL: string = import.meta.env?.VITE_API_URL ?? 'http://localhost:4000/api';

const ACCESS_TOKEN_KEY = 'wt.accessToken';
const REFRESH_TOKEN_KEY = 'wt.refreshToken';

/**
 * Session storage, in two scopes.
 *
 * An ordinary sign-in goes to `localStorage`, so the session is shared by every
 * tab and survives a restart — the behaviour people expect.
 *
 * A Super Admin bypass session goes to `sessionStorage` instead, which is
 * per-tab. That is what lets the console open a client's workspace in a new tab
 * while the operator's own session keeps running, untouched, in the original
 * one. Reads prefer the tab-scoped token, so a tab that holds a bypass session
 * always acts as the admin and never accidentally as the operator.
 */
export const tokenStore = {
  getAccess: () => sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY),

  /** True when this tab is running a bypass session of its own. */
  isTabScoped: () => sessionStorage.getItem(ACCESS_TOKEN_KEY) !== null,

  set(accessToken: string, refreshToken: string) {
    // Refreshing inside a bypass tab must stay inside that tab.
    const store = tokenStore.isTabScoped() ? sessionStorage : localStorage;
    store.setItem(ACCESS_TOKEN_KEY, accessToken);
    store.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /** Stores a bypass session, visible to this tab only. */
  setTabScoped(accessToken: string, refreshToken: string) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear() {
    // Ending a bypass session clears only this tab; the operator's own session
    // in localStorage is deliberately left alone.
    if (tokenStore.isTabScoped()) {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/** Error codes the UI branches on. Mirrors the server's `ErrorCode`. */
export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'MODULE_NOT_ASSIGNED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DEPENDENCY_REQUIRED'
  | 'HIERARCHY_VIOLATION'
  | 'ROSTER_CONFLICT'
  | 'RATE_LIMITED'
  | 'ACCOUNT_LOCKED'
  | 'SUBSCRIPTION_INACTIVE'
  | 'INTERNAL'
  | 'NETWORK';

export interface FieldIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field-level issues from a validation failure, ready for a form. */
  get fieldIssues(): FieldIssue[] {
    return Array.isArray(this.details) ? (this.details as FieldIssue[]) : [];
  }

  get isAuthError(): boolean {
    return this.code === 'UNAUTHORIZED';
  }

  get isAccessError(): boolean {
    return this.code === 'FORBIDDEN' || this.code === 'PERMISSION_DENIED' || this.code === 'MODULE_NOT_ASSIGNED';
  }
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  [key: string]: unknown;
}

export interface Paged<T> {
  data: T[];
  meta: PageMeta;
}

/** Called when a session can no longer be recovered, so the app can sign out. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Set for endpoints that must not trigger the refresh-and-retry dance. */
  skipAuthRetry?: boolean;
  /** Returns the raw text body instead of parsed JSON (used by CSV export). */
  raw?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function toApiError(response: Response): Promise<ApiError> {
  let code: ApiErrorCode = 'INTERNAL';
  let message = `Request failed with status ${response.status}`;
  let details: unknown;

  try {
    const body = await response.json();
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      details = body.error.details;
    }
  } catch {
    // A non-JSON error body (a proxy page, say) — keep the generic message.
  }

  return new ApiError(response.status, code, message, details);
}

/** Only one refresh runs at a time; concurrent 401s wait on the same promise. */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return false;
        const body = await response.json();
        tokenStore.set(body.data.accessToken, body.data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const send = async (): Promise<Response> => {
    const token = tokenStore.getAccess();
    return fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  };

  let response: Response;
  try {
    response = await send();
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'NETWORK', 'Could not reach the server. Check your connection and try again.');
  }

  // An expired access token is recoverable exactly once, silently.
  if (response.status === 401 && !options.skipAuthRetry && tokenStore.getRefresh()) {
    const refreshed = await refreshSession();
    if (refreshed) {
      try {
        response = await send();
      } catch {
        throw new ApiError(0, 'NETWORK', 'Could not reach the server. Check your connection and try again.');
      }
    } else {
      tokenStore.clear();
      onSessionExpired?.();
      throw new ApiError(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    const error = await toApiError(response);
    if (error.status === 401 && !options.skipAuthRetry) {
      tokenStore.clear();
      onSessionExpired?.();
    }
    throw error;
  }

  if (options.raw) return (await response.text()) as unknown as T;
  if (response.status === 204) return undefined as T;

  const body = await response.json();
  return (body?.data !== undefined ? body.data : body) as T;
}

/** For list endpoints, which return `{ data, meta }` together. */
export async function apiRequestPaged<T = unknown>(path: string, options: RequestOptions = {}): Promise<Paged<T>> {
  const token = tokenStore.getAccess();

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'NETWORK', 'Could not reach the server. Check your connection and try again.');
  }

  if (response.status === 401 && tokenStore.getRefresh()) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiRequestPaged<T>(path, options);
    }
    tokenStore.clear();
    onSessionExpired?.();
    throw new ApiError(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.');
  }

  if (!response.ok) throw await toApiError(response);

  const body = await response.json();
  return {
    data: body.data ?? [],
    meta: body.meta ?? { page: 1, pageSize: 25, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
  };
}

export { API_BASE_URL };
