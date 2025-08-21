import { useCart } from "../context/CartContext";

function formatQ(q) {
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 2 }).format(q);
}

export default function CartPanel() {
  const { open, setOpen, items, total, remove, setQty, clear } = useCart();

  return (
    <div className={`pz-cart ${open ? "show" : ""}`}>
      <div className="pz-cart__overlay" onClick={() => setOpen(false)} />
      <div className="pz-cart__panel">
        <div className="pz-cart__head">
          <h4>Tu carrito</h4>
          <button className="pz-btn pz-btn-ghost" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="pz-cart__body">
          {items.length === 0 ? (
            <div className="pz-empty">Tu carrito está vacío</div>
          ) : (
            items.map(it => (
              <div key={it.id} className="pz-cart-item">
                <img src={it.image} alt={it.name} />
                <div className="pz-cart-item__info">
                  <div className="pz-cart-item__top">
                    <span className="pz-cart-item__name">{it.name}</span>
                    <button className="pz-link-minor" onClick={() => remove(it.id)}>Eliminar</button>
                  </div>
                  <div className="pz-cart-item__controls">
                    <div className="pz-qty">
                      <button onClick={() => setQty(it.id, it.qty - 1)}>-</button>
                      <input value={it.qty} onChange={e => setQty(it.id, Number(e.target.value) || 1)} />
                      <button onClick={() => setQty(it.id, it.qty + 1)}>+</button>
                    </div>
                    <div className="pz-cart-item__price">{formatQ(it.price * it.qty)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pz-cart__foot">
          <div className="pz-cart__total">
            <span>Total</span>
            <strong>{formatQ(total)}</strong>
          </div>
          <div className="pz-cart__actions">
            <button className="pz-btn pz-btn-ghost" onClick={clear} disabled={!items.length}>Vaciar</button>
            <button className="pz-btn pz-btn-primary" disabled={!items.length}>Continuar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
