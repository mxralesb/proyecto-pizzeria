import { useCart } from "../context/CartContext";

export default function CartFab() {
  const { count, setOpen } = useCart();
  return (
    <button className="pz-fab" onClick={() => setOpen(true)} aria-label="Abrir carrito">
      🛒
      {count > 0 && <span className="pz-fab-badge">{count}</span>}
    </button>
  );
}
