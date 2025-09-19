import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RequireAdminOrClient({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const role = String(
    user?.role ?? user?.payload?.role ?? user?.data?.role ?? ""
  ).toLowerCase();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== "admin" && role !== "cliente") {
    return <Navigate to="/ops/pedidos" replace />;
  }

  return children;
}
