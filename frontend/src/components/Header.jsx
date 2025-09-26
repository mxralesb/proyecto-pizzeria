import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  // Cierra el menú al pasar a desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 820) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cierra con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Cierra clic fuera
  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const role = String(
    user?.role ?? user?.payload?.role ?? user?.data?.role ?? ""
  ).toLowerCase();

  const empRole = String(
    user?.employee_role ??
      user?.payload?.employee_role ??
      user?.data?.employee_role ??
      ""
  ).toLowerCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const canSeeMenu = role === "admin" || role === "cliente";
  const canSeeMesas = role === "admin" || empRole === "mesero";
  const canSeePOS = role === "admin" || empRole === "mesero";
  const canSeePedidos =
    role === "admin" ||
    empRole === "mesero" ||
    empRole === "cocinero" ||
    empRole === "repartidor";
  const canSeeRepartos = empRole === "repartidor";
  const canSeeCobros = empRole === "mesero";

  const linkCls = ({ isActive }) => `pz-link ${isActive ? "active" : ""}`;
  const closeOnClick = () => setOpen(false);

  return (
    <header className="pz-header">
      <div className="pz-container pz-header-inner">
        <Link to="/" className="pz-brand" onClick={closeOnClick}>
          <span className="pz-logo">🍕</span>
          <div className="pz-brand-text">
            <strong>Pizzas</strong>
            <small>Pizzería</small>
          </div>
        </Link>

        {/* Botón hamburguesa (SOLO móvil, icono circular) */}
        <button
          className={`pz-burger ${open ? "is-open" : ""}`}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mainmenu"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          {/* Icono: 3 líneas con stroke (no “rayitas”) */}
          <svg className="pz-burger-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <line x1="4" y1="7"  x2="20" y2="7"  />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        {/* NAV: desktop inline; móvil panel bajo el header */}
        <nav id="mainmenu" ref={navRef} className={`pz-nav ${open ? "open" : ""}`}>
          {canSeeMenu && (
            <NavLink to="/" end className={linkCls} onClick={closeOnClick}>
              Menú
            </NavLink>
          )}

          {canSeeMesas && (
            <NavLink to="/mesas" className={linkCls} onClick={closeOnClick}>
              Mesas
            </NavLink>
          )}

          {canSeePOS && (
            <NavLink to="/ops/pos" className={linkCls} onClick={closeOnClick}>
              POS
            </NavLink>
          )}

          {canSeePedidos && (
            <NavLink to="/ops/pedidos" className={linkCls} onClick={closeOnClick}>
              Pedidos
            </NavLink>
          )}

          {canSeeCobros && (
            <NavLink to="/cobros" className={linkCls} onClick={closeOnClick}>
              Cobros
            </NavLink>
          )}

          {canSeeRepartos && (
            <NavLink to="/repartos" className={linkCls} onClick={closeOnClick}>
              Repartos
            </NavLink>
          )}

          {role === "admin" && (
            <>
              <NavLink to="/empleados" className={linkCls} onClick={closeOnClick}>
                Empleados
              </NavLink>
              <NavLink to="/inventory" className={linkCls} onClick={closeOnClick}>
                Inventario
              </NavLink>
            </>
          )}
        </nav>

        {/* ÚNICO bloque de acciones */}
        <div className="pz-actions">
          {role === "cliente" && (
            <Link to="/perfil" className="pz-btn pz-btn-outline" onClick={closeOnClick}>
              Perfil
            </Link>
          )}

          {!user ? (
            <Link to="/login" className="pz-btn pz-btn-outline" onClick={closeOnClick}>
              Iniciar sesión
            </Link>
          ) : (
            <div className="pz-user">
              <span className="pz-user-name">Hola, {user.name}</span>
              <button className="pz-btn pz-btn-primary" onClick={handleLogout}>
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
