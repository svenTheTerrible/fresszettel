import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { clearToken, getStoredToken, login as loginRequest, register as registerRequest } from '../lib/auth';
import { AuthContext, type AuthContextValue } from './auth-context';

/** Wraps the app and owns the login state. Restores a session from localStorage. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const login = useCallback(async (email: string, password: string) => {
    const t = await loginRequest(email, password);
    setToken(t);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await registerRequest(email, password);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ token, login, register, logout }), [token, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
