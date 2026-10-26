import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Modules/Auth/useAuth.js";

export default function ProtectRouts() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p role="status">Checking authentication...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
