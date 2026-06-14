import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Define explicit numeric weights for role stratification
const roleHierarchy: Record<string, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'viewer' | 'operator' | 'admin';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-sky-600" />
      </div>
    );
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user) {
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[allowedRole] || 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}