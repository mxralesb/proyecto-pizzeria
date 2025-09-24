// frontend/src/api/menu.js
const API = import.meta.env.VITE_API_URL;

export async function getMenu() {
  const res = await fetch(`${API}/api/menu`);
  if (!res.ok) throw new Error("Error al cargar menú");
  return res.json();
}
