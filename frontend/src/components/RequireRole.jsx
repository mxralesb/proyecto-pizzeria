import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function readTokenPayload() {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  const part = raw.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function canonicalRole(user) {
  const base = String(user?.role || "").toLowerCase();
  if (["admin", "cliente", "mesero", "cocinero", "repartidor"].includes(base)) return base;

  const hinted = String(user?.employee_role || "").toLowerCase();
  if (["mesero", "cocinero", "repartidor"].includes(hinted)) return hinted;

  if (base === "empleado") {
    const payload = readTokenPayload();
    const er = String(payload?.employee_role || "").toLowerCase();
    if (["mesero", "cocinero", "repartidor"].includes(er)) return er;
  }
  return base;
}

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();
  const role = canonicalRole(user);
  if (!role) return <Navigate to="/" replace />;
  if (role === "admin") return children;
  return roles.includes(role) ? children : <Navigate to="/" replace />;
}
