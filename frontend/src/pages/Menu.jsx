import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import PromoCarousel from "../components/PromoCarousel";

export default function Menu() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    api.get("/menu").then((r) => setItems(r.data || []));
  }, []);

  const slides = useMemo(() => {
    if (!items.length) {
      return [
        {
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop",
          title: "Súper Pepperoni",
          subtitle: "Crujiente, queso derretido y pepperoni a tope.",
          ctaText: "Agregar al carrito",
          onClick: () => {},
        },
        {
          image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=1600&auto=format&fit=crop",
          title: "Cuatro Quesos",
          subtitle: "Mozzarella, gorgonzola, parmesano y provolone.",
          ctaText: "Probar ahora",
          onClick: () => {},
        },
      ];
    }

    const ordered = [...items].sort((a, b) => {
      const as = a.category === "pizza" ? 0 : 1;
      const bs = b.category === "pizza" ? 0 : 1;
      return as - bs || String(a.name).localeCompare(String(b.name));
    });

    return ordered.slice(0, 999).map((m) => ({
      image: m.image,
      title: m.name,
      subtitle: m.description,
      ctaText: "Agregar al carrito",
      onClick: () => add(m, 1),
    }));
  }, [items, add]);

  const openDetail = (item) => {
    setActive(item);
    setQty(1);
    setOpen(true);
  };
  const closeDetail = () => {
    setOpen(false);
    setActive(null);
  };

  return (
    <div className="pz-menu">
      <PromoCarousel slides={slides} />

      <h2>Menú</h2>
      <div className="pz-grid">
        {items.map((i) => (
          <article key={i.id} className="pz-card" onClick={() => openDetail(i)}>
            <div className="pz-card-media">
              <img src={i.image} alt={i.name} />
              <span className="pz-chip">{i.category}</span>
            </div>
            <div className="pz-card-body">
              <h3>{i.name}</h3>
              <p className="pz-desc">{i.description}</p>
              <div className="pz-card-foot">
                <span className="pz-price">Q{i.price}</span>
                <button
                  className="pz-btn pz-btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    add(i, 1);
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {open && active && (
        <div className="pz-modal" onClick={closeDetail}>
          <div className="pz-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="pz-modal-close" onClick={closeDetail}>
              ✕
            </button>
            <img className="pz-modal-img" src={active.image} alt={active.name} />
            <div className="pz-modal-body">
              <h3 className="pz-modal-title">{active.name}</h3>
              <p className="pz-modal-text">{active.description}</p>
              <div className="pz-modal-actions">
                <span className="pz-price-lg">Q{active.price}</span>
                <div className="pz-qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                  <input
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  />
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <button
                  className="pz-btn pz-btn-primary"
                  onClick={() => {
                    add(active, qty);
                    closeDetail();
                  }}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
