import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/i18n';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) return <div className="page-center">{t('common.loading')}</div>;
  if (!session) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
