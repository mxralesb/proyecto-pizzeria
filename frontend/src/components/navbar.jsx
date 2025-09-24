import { useEffect, useRef, useState } from "react";
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
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
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

  // responsive state
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // close on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  // close with ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // close on click outside
  useEffect(() => {
    const onClick = (e) => {
      if (!menuOpen) return;
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  // close if resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 820) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

        {/* botón hamburguesa (solo móvil) */}
        <button
          type="button"
          className={`pz-burger ${menuOpen ? "is-open" : ""}`}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          aria-controls="mainmenu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav
          id="mainmenu"
          ref={navRef}
          className={`pz-nav ${menuOpen ? "open" : ""}`}
          aria-hidden={!menuOpen && typeof window !== "undefined" && window.innerWidth < 820}
        >
          <Link to="/" className={linkCls("/")}>Menú</Link>

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
              <Link to="/cobros" className={linkCls("/cobros")}>Cobros</Link>
            </>
          )}

          {role === "cocinero" && (
            <Link to="/ops/pedidos" className={linkCls("/ops/pedidos")}>Pedidos</Link>
          )}

          {role === "repartidor" && (
            <>
              <Link to="/ops/pedidos" className={linkCls("/ops/pedidos")}>Pedidos</Link>
              <Link to="/repartos" className={linkCls("/repartos")}>Repartos</Link>
            </>
          )}

          {/* acciones también dentro del menú móvil */}
          <div className="pz-actions pz-actions--mobile">
            <button
              className="pz-btn pz-btn-ghost"
              onClick={handleCartClick}
              type="button"
              aria-label="Abrir carrito"
            >
              🛒{user && count > 0 && <span style={{ marginLeft: 6, fontWeight: 700 }}>{count}</span>}
            </button>

            {role === "cliente" && (
              <Link to="/perfil" className="pz-btn pz-btn-outline">Perfil</Link>
            )}

            {!user ? (
              <Link to="/login" className="pz-btn pz-btn-outline">Iniciar sesión</Link>
            ) : (
              <Link to="/logout" className="pz-btn pz-btn-primary">Salir</Link>
            )}
          </div>
        </nav>

        {/* acciones visibles en desktop */}
        <div className="pz-actions pz-actions--desktop">
          <button
            className="pz-btn pz-btn-ghost"
            onClick={handleCartClick}
            type="button"
            aria-label="Abrir carrito"
          >
            🛒{user && count > 0 && <span style={{ marginLeft: 6, fontWeight: 700 }}>{count}</span>}
          </button>

          {role === "cliente" && (
            <Link to="/perfil" className="pz-btn pz-btn-outline">Perfil</Link>
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
