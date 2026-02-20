import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import type { RoleThemeKey } from '@/constants/theme';

export type ResponderUser = {
  role: RoleThemeKey;
  username: string;
  email?: string;
};

type AuthState = {
  isResponder: boolean;
  user: ResponderUser | null;
};

type AuthContextValue = AuthState & {
  login: (user: ResponderUser) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<ResponderUser, 'username' | 'email'>>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isResponder: false,
    user: null,
  });

  const login = useCallback((user: ResponderUser) => {
    setState({ isResponder: true, user: { ...user } });
  }, []);

  const logout = useCallback(() => {
    setState({ isResponder: false, user: null });
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<ResponderUser, 'username' | 'email'>>) => {
    setState((prev) =>
      prev.user
        ? { ...prev, user: { ...prev.user, ...updates } }
        : prev
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
