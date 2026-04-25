import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { user, isAuthed, loading } = useAuth();

  if (loading) return null;

  if (!isAuthed) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = (user?.role || "").trim().toLowerCase();
  const normalizedAllowedRoles = (allowedRoles || []).map((role) => role.trim().toLowerCase());

  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
