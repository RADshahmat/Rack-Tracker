// src/features/auth/components/RoleGuard.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

// Mirroring your system's authorization weight metrics
const roleHierarchy: Record<string, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
};

interface RoleGuardProps {
  children: React.ReactNode;
  /** The minimum role level required to see the wrapped elements */
  minRole: 'viewer' | 'operator' | 'admin';
  /** Optional element to render if the user lacks permissions (e.g., a disabled button or lock icon) */
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, minRole, fallback = null }: RoleGuardProps) {
  const { isAuthenticated, user } = useAuth();

  // If not logged in, show nothing (or fallback)
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[minRole] || 0;

  // Render children only if user meets or exceeds the required functional tier
  if (userLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}