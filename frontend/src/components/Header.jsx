import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = String(
    user?.role ?? user?.payload?.role ?? user?.data?.role ?? ""
  ).toLowerCase();

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
          <NavLink to="/" end className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
            Menú
          </NavLink>
          <NavLink to="/reservar" className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
            Reservar
          </NavLink>
          {user && (
            <NavLink to="/mis-reservas" className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
              Mis reservas
            </NavLink>
          )}
          {role === "admin" && (
            <>
              <NavLink to="/admin" className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
                Admin
              </NavLink>
              <NavLink to="/empleados" className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
                Empleados
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
                Órdenes
              </NavLink>
              <NavLink to="/delivery" className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
                Delivery
              </NavLink>
              <NavLink to="/inventory" className={({ isActive }) => `pz-link ${isActive ? "active" : ""}`}>
                Inventario
              </NavLink>
            </>
          )}
        </nav>

        <div className="pz-actions">
          {role === "cliente" && (
            <Link to="/perfil" className="pz-btn pz-btn-outline">
              Perfil
            </Link>
          )}
          {!user ? (
            <>
              <Link to="/login" className="pz-btn pz-btn-outline">
                Iniciar sesión
              </Link>
            </>
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
