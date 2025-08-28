import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";

export default function Navbar() {
  const { count, setOpen } = useCart();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const role = String(user?.role ?? user?.payload?.role ?? user?.data?.role ?? "").toLowerCase();

  const handleCartClick = () => {
    if (!user) {
      alert("Inicia sesión para ver el carrito");
      return;
    }
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
          <Link to="/" className={`pz-link ${pathname === "/" ? "active" : ""}`}>Menú</Link>
          <Link to="/reservar" className={`pz-link ${pathname === "/reservar" ? "active" : ""}`}>Reservar</Link>
          {user && (
            <Link to="/mis-reservas" className={`pz-link ${pathname === "/mis-reservas" ? "active" : ""}`}>
              Mis reservas
            </Link>
          )}
          {role === "admin" && (
            <>
              <Link to="/empleados" className={`pz-link ${pathname === "/empleados" ? "active" : ""}`}>Empleados</Link>
              <Link to="/admin/employees/new" className={`pz-link ${pathname === "/admin/employees/new" ? "active" : ""}`}>
                ➕ Agregar empleado
              </Link>
              <Link to="/orders" className={`pz-link ${pathname === "/orders" ? "active" : ""}`}>Órdenes</Link>
              <Link to="/delivery" className={`pz-link ${pathname === "/delivery" ? "active" : ""}`}>Delivery</Link>
            </>
          )}
        </nav>

        <div className="pz-actions">
          <button
            className="pz-btn pz-btn-ghost"
            onClick={handleCartClick}
            aria-label="Abrir carrito"
            type="button"
          >
            🛒
            {user && count > 0 && <span style={{ marginLeft: 6, fontWeight: 700 }}>{count}</span>}
          </button>

          {role === "cliente" && (
            <Link to="/perfil" className={`pz-btn pz-btn-outline ${pathname === "/perfil" ? "active" : ""}`}>Perfil</Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className="pz-btn pz-btn-outline">Iniciar sesión</Link>
              <Link to="/registro" className="pz-btn pz-btn-primary">Crear cuenta</Link>
            </>
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
