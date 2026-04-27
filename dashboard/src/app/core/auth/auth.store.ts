import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface AuthUser {
  uuid: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
}

export interface CompanyContext {
  membershipId: number;
  role: string;
  company: {
    uuid: string;
    name: string;
    code: string;
    isActive: boolean;
  };
}

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  context: CompanyContext | null;
  isLoading: boolean;
}

function loadPersistedState(): Partial<AuthState> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const token = localStorage.getItem('access_token');
    const userJson = localStorage.getItem('auth_user');
    const contextJson = localStorage.getItem('auth_context');
    return {
      accessToken: token,
      user: userJson ? JSON.parse(userJson) : null,
      context: contextJson ? JSON.parse(contextJson) : null,
    };
  } catch {
    return {};
  }
}

const persisted = loadPersistedState();

const initialState: AuthState = {
  accessToken: persisted.accessToken ?? null,
  user: persisted.user ?? null,
  context: persisted.context ?? null,
  isLoading: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setAuth(accessToken: string, user: AuthUser, context: CompanyContext | null): void {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
      if (context) {
        localStorage.setItem('auth_context', JSON.stringify(context));
      }
      patchState(store, { accessToken, user, context });
    },
    setContext(context: CompanyContext): void {
      localStorage.setItem('auth_context', JSON.stringify(context));
      patchState(store, { context });
    },
    setAccessToken(accessToken: string): void {
      localStorage.setItem('access_token', accessToken);
      patchState(store, { accessToken });
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },
    clearAuth(): void {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_context');
      patchState(store, { accessToken: null, user: null, context: null });
    },
    isLoggedIn(): boolean {
      return !!store.accessToken();
    },
  })),
);
