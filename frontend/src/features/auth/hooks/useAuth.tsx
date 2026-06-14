import { createContext, useContext} from 'react';
import type { User, AuthState } from '@/types/index';


interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Export for the provider component
export { AuthContext };
export type { AuthContextType };

// Hook to create the auth value
export function createAuthValue(
  user: User | null,
  isLoading: boolean,
  login: (username: string, password: string) => Promise<void>,
  logout: () => Promise<void>,
  hasRole: (role: string | string[]) => boolean
): AuthContextType {
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };
}
