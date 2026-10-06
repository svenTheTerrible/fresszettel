import { createContext, useContext } from 'react';

export interface AuthContextValue {
  /** The JWT access token, or null when not logged in. */
  token: string | null;
  /** Log in; throws (with a user-facing message) on failure. */
  login: (email: string, password: string) => Promise<void>;
  /** Clear the session. */
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Read the current auth state. Must be used within an <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
