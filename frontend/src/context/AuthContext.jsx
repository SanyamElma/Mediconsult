import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authService } from '../services/api';
import { config } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(config.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const persist = useCallback((session) => {
    localStorage.setItem(config.TOKEN_KEY, session.accessToken);
    if (session.refreshToken) localStorage.setItem(config.REFRESH_KEY, session.refreshToken);
    localStorage.setItem(config.USER_KEY, JSON.stringify(session.user));
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const session = await authService.login(credentials);
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const registerUser = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const session = await authService.registerUser(data);
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const registerDoctor = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const session = await authService.registerDoctor(data);
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(config.TOKEN_KEY);
    localStorage.removeItem(config.REFRESH_KEY);
    localStorage.removeItem(config.USER_KEY);
    setUser(null);
  }, []);

  const updateCurrentUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(config.USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Keep auth in sync across browser tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === config.USER_KEY) setUser(e.newValue ? JSON.parse(e.newValue) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      role: user?.role,
      login,
      logout,
      registerUser,
      registerDoctor,
      updateCurrentUser,
    }),
    [user, loading, login, logout, registerUser, registerDoctor, updateCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
