import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessPath, SUPER_ADMIN_ONLY_PATHS } from '../config/routePermissions';
import { hasPermission } from '../config/rolesAndPermissions';

const ProtectedRoute = ({ children, permission: permissionProp }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: path }} />;
  }

  if (SUPER_ADMIN_ONLY_PATHS.some((p) => path.startsWith(p)) && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/unauthorized" replace state={{ from: path }} />;
  }

  const permissions = user.permissions ?? [];
  const required = permissionProp ? [permissionProp] : null;
  const allowed = required
    ? hasPermission(permissions, required[0])
    : canAccessPath(permissions, path);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace state={{ from: path }} />;
  }

  return children;
};

export default ProtectedRoute;




