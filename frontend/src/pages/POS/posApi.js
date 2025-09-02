// rutas simples: ajusta si tus endpoints difieren
export async function getOccupiedTables(api) {
  // Espera GET /api/mesas  -> [{id, name, status}]
  const { data } = await api.get("/mesas");
  // Filtra solo las ocupadas (ajusta el campo si tu API usa otro)
  return data.filter((m) => String(m.status ?? m.estado ?? "LIBRE").toLowerCase() !== "libre");
}

export async function getMenuItems(api) {
  // Espera GET /api/menu  -> [{id, name, description, price}]
  const { data } = await api.get("/menu");
  // Normaliza: tu modelo usa "precio" tal vez, mapea a "price"
  return data.map((x) => ({
    id: x.id ?? x.id_menu ?? x.id_menu_item ?? x.iditem ?? x.id,
    name: x.name ?? x.nombre,
    description: x.description ?? x.descripcion ?? "",
    price: Number(x.price ?? x.precio ?? 0),
  }));
}

export async function createPOSOrder(api, payload) {
  // payload: { mesa_id, note, items:[{id_menu_item, qty}] }
  return api.post("/ops/orders/pos", payload);
}
