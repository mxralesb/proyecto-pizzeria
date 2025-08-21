import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="pz-header">
      <div className="pz-container pz-header-inner">
        <Link to="/" className="pz-brand">
          <span className="pz-logo">🍕</span>
          <div className="pz-brand-text">
            <strong>Pizzas</strong>
            <small>Pizzería</small>
          </div>
        </Link>

        <nav className="pz-nav">
          <NavLink to="/" end className="pz-link">Menú</NavLink>
          <NavLink to="/reservar" className="pz-link">Reservar</NavLink>
          {user && <NavLink to="/mis-reservas" className="pz-link">Mis reservas</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin" className="pz-link">Admin</NavLink>}
        </nav>

        <div className="pz-actions">
          {!user ? (
            <Link to="/login" className="pz-btn pz-btn-outline">Iniciar sesión</Link>
          ) : (
            <div className="pz-user">
              <span className="pz-user-name">Hola, {user.name}</span>
              <button className="pz-btn pz-btn-primary" onClick={handleLogout}>Salir</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
