import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/index';
import { authApi } from '../api/index';
import { AuthContext, createAuthValue } from '../hooks/useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password });
      if (response.success && response.data) {
        setUser(response.data);
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const authValue = createAuthValue(user, isLoading, login, logout, hasRole);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}
