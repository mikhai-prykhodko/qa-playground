import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';

/** Redirects anonymous users to the login page and comes back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { to } = useMarket();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`${to('login')}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}
