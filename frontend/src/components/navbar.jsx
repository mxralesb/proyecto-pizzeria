import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
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
    const p = readTokenPayload();
    const er = String(p?.employee_role || "").toLowerCase();
    if (["mesero", "cocinero", "repartidor"].includes(er)) return er;
  }
  return base;
}

export default function Navbar() {
  const { count, setOpen } = useCart();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const role = canonicalRole(user);
  const linkCls = (to) => `pz-link ${pathname === to ? "active" : ""}`;

  const handleCartClick = () => {
    if (!user) return alert("Inicia sesión para ver el carrito");
    setOpen(true);
  };

  return (
    <header className="pz-header">
      <div className="pz-container pz-header-inner">
        <Link to="/" className="pz-brand">
          <span className="pz-logo">🍕</span>
          <span className="pz-brand-text">
            <strong>Pizzas</strong>
            <small>Pizzería</small>
          </span>
        </Link>

        <nav className="pz-nav">
          <Link to="/" className={linkCls("/")}>Menú</Link>
          <Link to="/reservar" className={linkCls("/reservar")}>Reservar</Link>
          {user && <Link to="/mis-reservas" className={linkCls("/mis-reservas")}>Mis reservas</Link>}

          {role === "admin" && (
            <>
              <Link to="/empleados" className={linkCls("/empleados")}>Empleados</Link>
              <Link to="/admin/employees/new" className={linkCls("/admin/employees/new")}>➕ Agregar empleado</Link>
              <Link to="/orders" className={linkCls("/orders")}>Órdenes</Link>
              <Link to="/delivery" className={linkCls("/delivery")}>Delivery</Link>
              <Link to="/inventory" className={linkCls("/inventory")}>Inventario</Link>
              <Link to="/mesas" className={linkCls("/mesas")}>Mesas</Link>
              <Link to="/ops/pos" className={linkCls("/ops/pos")}>POS</Link>
              <Link to="/ops/pedidos" className={linkCls("/ops/pedidos")}>Ops</Link>
            </>
          )}

          {role === "mesero" && (
            <>
              <Link to="/mesas" className={linkCls("/mesas")}>Mesas</Link>
              <Link to="/ops/pos" className={linkCls("/ops/pos")}>POS</Link>
              <Link to="/ops/pedidos" className={linkCls("/ops/pedidos")}>Pedidos</Link>
            </>
          )}

          {role === "cocinero" && (
            <Link to="/ops/pedidos" className={linkCls("/ops/pedidos")}>Pedidos</Link>
          )}

          {role === "repartidor" && (
            <Link to="/ops/pedidos" className={linkCls("/ops/pedidos")}>Pedidos</Link>
          )}
        </nav>

        <div className="pz-actions">
          <button className="pz-btn pz-btn-ghost" onClick={handleCartClick} aria-label="Abrir carrito" type="button">
            🛒{user && count > 0 && <span style={{ marginLeft: 6, fontWeight: 700 }}>{count}</span>}
          </button>

          {role === "cliente" && (
            <Link to="/perfil" className={linkCls("/perfil").replace("pz-link", "pz-btn pz-btn-outline")}>Perfil</Link>
          )}

          {!user ? (
            <Link to="/login" className="pz-btn pz-btn-outline">Iniciar sesión</Link>
          ) : (
            <>
              <span className="pz-user"><span className="pz-user-name">Hola, {user.name}</span></span>
              <Link to="/logout" className="pz-btn pz-btn-primary">Salir</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
