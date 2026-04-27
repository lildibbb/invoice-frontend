import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

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

interface AuthState {
  user: AuthUser | null;
  context: CompanyContext | null;
  accessToken: string | null;
  isLoggedIn: boolean;

  setAuth: (user: AuthUser, context: CompanyContext | null, token: string) => void;
  setContext: (context: CompanyContext) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      context: null,
      accessToken: null,
      isLoggedIn: false,

      setAuth: (user, context, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }
        set({ user, context, accessToken: token, isLoggedIn: true });
      },

      setContext: (context) => set({ context }),

      setAccessToken: (token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }
        set({ accessToken: token });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        set({ user: null, context: null, accessToken: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        context: state.context,
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

// Reliable hydration hook using Zustand persist API
export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(useAuthStore.persist.hasHydrated());
    return () => { unsub(); };
  }, []);

  return hydrated;
}
