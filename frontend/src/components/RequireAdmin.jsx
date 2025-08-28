import { useAuth } from "../context/authContext";

export default function RequireAdmin({ children }) {
  const { user } = useAuth(); 
  if (!user) return <div>Inicia sesión…</div>;
  if (user.role !== "admin") return <div>No tienes permisos.</div>;
  return children;
}
