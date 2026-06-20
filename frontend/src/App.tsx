import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/components/shared/ThemeProvider';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { RacksPage } from '@/features/racks/pages/RacksPage';
import { EquipmentPage } from '@/features/equipment/pages/EquipmentPage';
import { SchedulerPage } from '@/features/admin/pages/SchedulerPage';
import { WarningsPage } from '@/features/admin/pages/WarningsPage';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function AppContentWrapper() {
  const { theme } = useTheme();

  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes -
              requiredLevel defaults to 0.
              Any logged-in user (viewer, operator, or admin) can pass through this outer shell.
            */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Core features accessible by all authenticated users */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/racks" element={<RacksPage />} />
              <Route path="/equipment" element={<EquipmentPage />} />

              {/* Admin-only routes - role based routes*/}
              <Route path="/admin/scheduler"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <SchedulerPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/warnings"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <WarningsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* Catch-all fallback */}
            <Route path="/404" element={<div>Page Not Found</div>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
      <Toaster
        position="top-right"
        theme={theme === 'dark' ? 'dark' : 'light'}
        richColors
        closeButton
      />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContentWrapper />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
