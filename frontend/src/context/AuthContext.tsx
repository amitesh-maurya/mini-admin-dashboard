'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginPayload, RegisterPayload } from '@/types';
import { authService } from '@/services/auth.service';
import { setStoredToken, removeStoredToken } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hydrate auth state from server cookie on mount
  useEffect(() => {
    authService
      .getMe()
      .then((res) => {
        if (res.success && res.data) setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    if (res.success && res.data) {
      // Store the access token so it can be sent in Authorization headers
      // on subsequent requests (required for cross-origin deployments).
      if (res.accessToken) setStoredToken(res.accessToken);
      setUser(res.data);
      router.push('/dashboard');
    }
  }, [router]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    if (res.success && res.data) {
      if (res.accessToken) setStoredToken(res.accessToken);
      setUser(res.data);
      router.push('/dashboard');
    }
  }, [router]);

  const logout = useCallback(async () => {
    await authService.logout();
    removeStoredToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
