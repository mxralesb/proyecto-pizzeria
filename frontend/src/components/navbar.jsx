import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";

export default function Navbar() {
  const { count, setOpen } = useCart();
  const { pathname } = useLocation();
  const { user } = useAuth(); 

  return (
    <header className="pz-header">
      <div className="pz-header__left">
        <Link to="/" className="pz-brand">🍕 Pizzas</Link>
        <nav className="pz-nav">
          <Link to="/" className={pathname === "/" ? "active" : ""}>Menú</Link>
          <Link to="/reservar" className={pathname === "/reservar" ? "active" : ""}>Reservar</Link>

          {user?.role === "admin" && (
            <Link to="/mis-reservas" className={pathname === "/mis-reservas" ? "active" : ""}>
              Mis reservas
            </Link>
          )}
        </nav>
      </div>
      <div className="pz-header__right">
        <button className="pz-cartbtn" onClick={() => setOpen(true)}>
          🛒
          {count > 0 && <span className="pz-badge">{count}</span>}
        </button>
        <Link to="/login" className="pz-btn-outline">Iniciar sesión</Link>
      </div>
    </header>
  );
}
