import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RequireClient({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "cliente") return <Navigate to="/" replace />;
  return children;
}
