import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="page-center">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
