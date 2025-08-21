import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => {
    try { const raw = localStorage.getItem("cart:v1"); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  });

  const [flash, setFlash] = useState(null);
  const showFlash = (msg) => {
    setFlash(msg);
    clearTimeout(showFlash._t);
    showFlash._t = setTimeout(() => setFlash(null), 2000);
  };

  useEffect(() => { localStorage.setItem("cart:v1", JSON.stringify(items)); }, [items]);

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const total = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);

  const add = (product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(p => p.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, qty }];
    });
    showFlash("Se agregó correctamente");
    setOpen(true);
  };

  const remove = id => setItems(prev => prev.filter(p => p.id !== id));
  const setQty = (id, qty) => setItems(prev => prev.map(p => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p)));
  const clear = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ open, setOpen, items, count, total, add, remove, setQty, clear, flash }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
