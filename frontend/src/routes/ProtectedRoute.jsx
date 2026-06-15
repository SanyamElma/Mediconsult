import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from '../constants';

/**
 * Guards routes by authentication and (optionally) role.
 * - Unauthenticated users are redirected to /login (preserving intended destination).
 * - Authenticated users lacking the required role are sent to their own home.
 */
export default function ProtectedRoute({ allow }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }

  return <Outlet />;
}
