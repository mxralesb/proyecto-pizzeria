import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const canSeeMesas = role === "admin" || empRole === "mesero";
  const canSeePOS = role === "admin" || empRole === "mesero";
  const canSeePedidos =
    role === "admin" ||
    empRole === "mesero" ||
    empRole === "cocinero" ||
    empRole === "repartidor";
  const canSeeRepartos =
    empRole === "repartidor";

  const canSeeCobros = empRole === "mesero";

  const linkCls = ({ isActive }) => `pz-link ${isActive ? "active" : ""}`;

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
          <NavLink to="/" end className={linkCls}>
            Menú
          </NavLink>

          {canSeeMesas && (
            <NavLink to="/mesas" className={linkCls}>
              Mesas
            </NavLink>
          )}

          {canSeePOS && (
            <NavLink to="/ops/pos" className={linkCls}>
              POS
            </NavLink>
          )}

          {canSeePedidos && (
            <NavLink to="/ops/pedidos" className={linkCls}>
              Pedidos
            </NavLink>
          )}

          {canSeeCobros && (
            <NavLink to="/cobros" className={linkCls}>
              Cobros
            </NavLink>
          )}

          {canSeeRepartos && (
            <NavLink to="/repartos" className={linkCls}>
              Repartos
            </NavLink>
          )}

          {role === "admin" && (
            <>
              <NavLink to="/empleados" className={linkCls}>
                Empleados
              </NavLink>
              <NavLink to="/inventory" className={linkCls}>
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
