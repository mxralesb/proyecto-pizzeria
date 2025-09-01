import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";
import styles from "./HeaderBar.module.css";

export default function HeaderBar() {
  const { count, setOpen } = useCart();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const role = String(
    user?.role ?? user?.payload?.role ?? user?.data?.role ?? ""
  ).toLowerCase();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>🍕</span>
          <span className={styles.brandText}>Pizzas</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}>Menú</Link>
          <Link to="/reservar" className={`${styles.link} ${pathname === "/reservar" ? styles.active : ""}`}>Reservar</Link>
          {user && (
            <Link to="/mis-reservas" className={`${styles.link} ${pathname === "/mis-reservas" ? styles.active : ""}`}>
              Mis reservas
            </Link>
          )}
          {role === "admin" && (
            <>
              <Link to="/empleados" className={`${styles.link} ${pathname === "/empleados" ? styles.active : ""}`}>Empleados</Link>
              <Link to="/admin/employees/new" className={`${styles.link} ${pathname === "/admin/employees/new" ? styles.active : ""}`}>➕ Agregar</Link>
              <Link to="/orders" className={`${styles.link} ${pathname === "/orders" ? styles.active : ""}`}>Órdenes</Link>
              <Link to="/delivery" className={`${styles.link} ${pathname === "/delivery" ? styles.active : ""}`}>Delivery</Link>
              <Link to="/inventory" className={`${styles.link} ${pathname === "/inventory" ? styles.active : ""}`}>Inventario</Link>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          <button className={styles.cartbtn} onClick={() => setOpen(true)} aria-label="Abrir carrito">
            🛒{count > 0 && <span className={styles.badge}>{count}</span>}
          </button>

          {role === "cliente" && (
            <Link to="/perfil" className={styles.btnOutline}>Perfil</Link>
          )}

          {!user ? (
            <Link to="/login" className={styles.btnOutline}>Iniciar sesión</Link>
          ) : (
            <>
              <span className={styles.user}>Hola, {user.name}</span>
              <Link to="/logout" className={styles.btnPrimary}>Salir</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
