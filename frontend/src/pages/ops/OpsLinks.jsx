// frontend/src/components/ops/OpsLinks.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export default function OpsLinks() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const { pathname } = useLocation();

  if (!["mesero","cocinero","repartidor","admin"].includes(role)) return null;

  return (
    <>
      <Link to="/ops/pedidos" className={`pz-link ${pathname === "/ops/pedidos" ? "active" : ""}`}>Pedidos (Ops)</Link>
      {["mesero","admin"].includes(role) && (
        <Link to="/ops/pos" className={`pz-link ${pathname === "/ops/pos" ? "active" : ""}`}>POS (Ops)</Link>
      )}
    </>
  );
}