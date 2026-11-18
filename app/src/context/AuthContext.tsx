import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { USERS, type Role } from '../data/users';

const STORAGE_KEY = 'qa.session';

export interface SessionUser {
  username: string;
  displayName: string;
  role: Role;
}

export type LoginResult = 'ok' | 'invalid' | 'locked' | 'required';

interface AuthContextValue {
  user: SessionUser | null;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSession);

  const login = useCallback((username: string, password: string): LoginResult => {
    if (!username.trim() || !password) return 'required';
    const found = USERS.find((u) => u.username === username.trim() && u.password === password);
    if (!found) return 'invalid';
    if (found.locked) return 'locked';
    const session: SessionUser = { username: found.username, displayName: found.displayName, role: found.role };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return 'ok';
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
