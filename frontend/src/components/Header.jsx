import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  // Cierra el menú al cambiar a desktop
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

  return (
    <header className="pz-header">
      <div className="pz-container pz-header-inner">
        <Link to="/" className="pz-brand" onClick={() => setOpen(false)}>
          <span className="pz-logo">🍕</span>
          <div className="pz-brand-text">
            <strong>Pizzas</strong>
            <small>Pizzería</small>
          </div>
        </Link>

        {/* Botón hamburguesa + etiqueta “Menú/Cerrar” (solo móvil) */}
        <button
          className={`pz-burger ${open ? "is-open" : ""}`}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mainmenu"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span />
          <span />
          <span />
          <span className="pz-burger-label">{open ? "Cerrar" : "Menú"}</span>
        </button>

        {/* NAV: desktop inline; móvil como panel desplegable */}
        <nav
          id="mainmenu"
          ref={navRef}
          className={`pz-nav ${open ? "open" : ""}`}
        >
          {canSeeMenu && (
            <NavLink to="/" end className={linkCls} onClick={() => setOpen(false)}>
              Menú
            </NavLink>
          )}

          {canSeeMesas && (
            <NavLink to="/mesas" className={linkCls} onClick={() => setOpen(false)}>
              Mesas
            </NavLink>
          )}

          {canSeePOS && (
            <NavLink to="/ops/pos" className={linkCls} onClick={() => setOpen(false)}>
              POS
            </NavLink>
          )}

          {canSeePedidos && (
            <NavLink to="/ops/pedidos" className={linkCls} onClick={() => setOpen(false)}>
              Pedidos
            </NavLink>
          )}

          {canSeeCobros && (
            <NavLink to="/cobros" className={linkCls} onClick={() => setOpen(false)}>
              Cobros
            </NavLink>
          )}

          {canSeeRepartos && (
            <NavLink to="/repartos" className={linkCls} onClick={() => setOpen(false)}>
              Repartos
            </NavLink>
          )}

          {role === "admin" && (
            <>
              <NavLink to="/empleados" className={linkCls} onClick={() => setOpen(false)}>
                Empleados
              </NavLink>
              <NavLink to="/inventory" className={linkCls} onClick={() => setOpen(false)}>
                Inventario
              </NavLink>
            </>
          )}

          {/* Acciones también dentro del menú en móvil */}
          <div className="pz-actions pz-actions--mobile">
            {role === "cliente" && (
              <Link
                to="/perfil"
                className="pz-btn pz-btn-outline"
                onClick={() => setOpen(false)}
              >
                Perfil
              </Link>
            )}

            {!user ? (
              <Link
                to="/login"
                className="pz-btn pz-btn-outline"
                onClick={() => setOpen(false)}
              >
                Iniciar sesión
              </Link>
            ) : (
              <button
                className="pz-btn pz-btn-primary"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
              >
                Salir
              </button>
            )}
          </div>
        </nav>

        {/* Acciones en desktop (ocultas en móvil) */}
        <div className="pz-actions pz-actions--desktop">
          {role === "cliente" && (
            <Link to="/perfil" className="pz-btn pz-btn-outline">
              Perfil
            </Link>
          )}

          {!user ? (
            <Link to="/login" className="pz-btn pz-btn-outline">
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
