import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";
import { useState, useMemo } from "react";
import styles from "./HeaderBar.module.css";

export default function HeaderBar() {
  const { count, setOpen } = useCart();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const role = String(
    user?.role ?? user?.payload?.role ?? user?.data?.role ?? ""
  ).toLowerCase();
  const empRole = String(
    user?.employee_role ??
      user?.payload?.employee_role ??
      user?.data?.employee_role ??
      ""
  ).toLowerCase();

  // Cierra el panel al cambiar de ruta
  // (si usas React Router, pathname cambia en cada navegación)
  useMemo(() => { setIsOpen(false); return null; }, [pathname]);

  // Reutilizamos una lista de enlaces según rol para desktop y mobile
  const links = (
    <>
      <Link
        to="/"
        className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
      >
        Menú
      </Link>

      <Link
        to="/reservar"
        className={`${styles.link} ${pathname === "/reservar" ? styles.active : ""}`}
      >
        Reservar
      </Link>

      {user && (
        <Link
          to="/mis-reservas"
          className={`${styles.link} ${pathname === "/mis-reservas" ? styles.active : ""}`}
        >
          Mis reservas
        </Link>
      )}

      {(role === "admin" || empRole === "mesero") && (
        <Link
          to="/mesas"
          className={`${styles.link} ${pathname === "/mesas" ? styles.active : ""}`}
        >
          Mesas
        </Link>
      )}

      {role === "admin" && (
        <>
          <Link
            to="/empleados"
            className={`${styles.link} ${pathname === "/empleados" ? styles.active : ""}`}
          >
            Empleados
          </Link>
          <Link
            to="/admin/employees/new"
            className={`${styles.link} ${pathname === "/admin/employees/new" ? styles.active : ""}`}
          >
            ➕ Agregar
          </Link>
          <Link
            to="/orders"
            className={`${styles.link} ${pathname === "/orders" ? styles.active : ""}`}
          >
            Órdenes
          </Link>
          <Link
            to="/delivery"
            className={`${styles.link} ${pathname === "/delivery" ? styles.active : ""}`}
          >
            Delivery
          </Link>
          <Link
            to="/inventory"
            className={`${styles.link} ${pathname === "/inventory" ? styles.active : ""}`}
          >
            Inventario
          </Link>
        </>
      )}

      {empRole === "repartidor" && (
        <Link
          to="/repartos"
          className={`${styles.link} ${pathname === "/repartos" ? styles.active : ""}`}
        >
          Repartos
        </Link>
      )}

      {empRole === "mesero" && (
        <Link
          to="/cobros"
          className={`${styles.link} ${pathname === "/cobros" ? styles.active : ""}`}
        >
          Cobros
        </Link>
      )}
    </>
  );

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>🍕</span>
          <span className={styles.brandText}>Pizzas</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Principal">
          {links}
        </nav>

        <div className={styles.actions}>
          {/* Botón menú (solo visible en mobile por CSS) */}
          <button
            type="button"
            className={styles.menuBtn}
            aria-label="Abrir menú"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsOpen(o => !o)}
          >
            <span className={styles.menuIcon} />
          </button>

          <button
            className={styles.cartbtn}
            onClick={() => setOpen(true)}
            aria-label="Abrir carrito"
          >
            🛒{count > 0 && <span className={styles.badge}>{count}</span>}
          </button>

          {role === "cliente" && (
            <Link to="/perfil" className={styles.btnOutline}>
              Perfil
            </Link>
          )}

          {!user ? (
            <Link to="/login" className={styles.btnOutline}>
              Iniciar sesión
            </Link>
          ) : (
            <>
              <span className={styles.user}>Hola, {user.name}</span>
              <Link to="/logout" className={styles.btnPrimary}>
                Salir
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Panel móvil */}
      <div
        id="mobile-nav"
        className={`${styles.navPanel} ${isOpen ? styles.open : ""}`}
        aria-hidden={!isOpen}
      >
        {/* Los mismos links pero con clases para panel */}
        {[
          { to: "/", label: "Menú" },
          { to: "/reservar", label: "Reservar" },
          ...(user ? [{ to: "/mis-reservas", label: "Mis reservas" }] : []),
          ...((role === "admin" || empRole === "mesero") ? [{ to: "/mesas", label: "Mesas" }] : []),
          ...(role === "admin"
            ? [
                { to: "/empleados", label: "Empleados" },
                { to: "/admin/employees/new", label: "➕ Agregar" },
                { to: "/orders", label: "Órdenes" },
                { to: "/delivery", label: "Delivery" },
                { to: "/inventory", label: "Inventario" },
              ]
            : []),
          ...(empRole === "repartidor" ? [{ to: "/repartos", label: "Repartos" }] : []),
          ...(empRole === "mesero" ? [{ to: "/cobros", label: "Cobros" }] : []),
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`${styles.panelLink} ${pathname === to ? styles.panelActive : ""}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
