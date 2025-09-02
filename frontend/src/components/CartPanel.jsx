import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";

function formatQ(q) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  }).format(q);
}

export default function CartPanel() {
  const { open, setOpen, items, total, remove, setQty, clear, count, PER_ITEM_MAX, CART_TOTAL_MAX } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && open) setOpen(false);
  }, [user, open, setOpen]);

  if (!user) return null;

  const handleContinue = () => {
    if (!items.length) return;
    setOpen(false);
    navigate("/checkout");
  };

  const handleInputChange = (id, v) => {
    const digits = String(v).replace(/\D/g, "");
    setQty(id, digits ? Number(digits) : 1);
  };

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
            items.map((it) => {
              const disableMinus = it.qty <= 1;
              const disablePlus = it.qty >= PER_ITEM_MAX || count >= CART_TOTAL_MAX;
              return (
                <div key={it.id} className="pz-cart-item">
                  <img src={it.image} alt={it.name} />
                  <div className="pz-cart-item__info">
                    <div className="pz-cart-item__top">
                      <span className="pz-cart-item__name">{it.name}</span>
                      <button className="pz-link-minor" onClick={() => remove(it.id)}>Eliminar</button>
                    </div>
                    <div className="pz-cart-item__controls">
                      <div className="pz-qty">
                        <button disabled={disableMinus} onClick={() => setQty(it.id, it.qty - 1)}>-</button>
                        <input
                          inputMode="numeric"
                          pattern="\d*"
                          min={1}
                          max={PER_ITEM_MAX}
                          value={it.qty}
                          onChange={(e) => handleInputChange(it.id, e.target.value)}
                        />
                        <button disabled={disablePlus} onClick={() => setQty(it.id, it.qty + 1)}>+</button>
                      </div>
                      <div className="pz-cart-item__price">{formatQ(it.price * it.qty)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pz-cart__foot">
          <div className="pz-cart__total">
            <span>Total</span>
            <strong>{formatQ(total)}</strong>
          </div>
          <div className="pz-cart__actions">
            <button className="pz-btn pz-btn-ghost" onClick={clear} disabled={!items.length}>
              Vaciar
            </button>
            <button
              className="pz-btn pz-btn-primary"
              disabled={!items.length}
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
            Máximo {CART_TOTAL_MAX} unidades por pedido y {PER_ITEM_MAX} por producto.
          </div>
        </div>
      </div>
    </div>
  );
}
