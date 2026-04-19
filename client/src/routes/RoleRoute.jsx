import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/useAuth";

const RoleRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, getHomeRouteForRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={getHomeRouteForRole()} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
