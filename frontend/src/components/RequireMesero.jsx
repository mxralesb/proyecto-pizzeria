import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RequireMesero({ children }) {
  const { user } = useAuth();
  const role = String(user?.role ?? user?.payload?.role ?? user?.data?.role ?? "").toLowerCase();
  const employeeRole = String(
    user?.employee_role ?? user?.payload?.employee_role ?? user?.data?.employee_role ?? ""
  ).toLowerCase();

  if (!(role === "admin" || employeeRole === "mesero")) {
    return <Navigate to="/" replace />;
  }
  return children;
}
