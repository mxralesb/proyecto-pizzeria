import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

const STORAGE_KEY = "pz-cart";
const PER_ITEM_MAX = 10;
const CART_TOTAL_MAX = 10;

export function CartProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const onClear = () => {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
    };
    window.addEventListener("pz:cart:clear", onClear);
    return () => window.removeEventListener("pz:cart:clear", onClear);
  }, []);

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const total = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);

  const clampQtyForTotals = (id, desired) => {
    const clean = Math.max(1, Math.min(PER_ITEM_MAX, Number(desired) || 1));
    const otherSum = items.reduce((s, it) => (it.id === id ? s : s + it.qty), 0);
    const maxAllowed = Math.max(0, CART_TOTAL_MAX - otherSum);
    return Math.max(1, Math.min(clean, maxAllowed));
  };

  const add = (product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        const nextQty = clampQtyForTotals(product.id, exists.qty + 1);
        return prev.map((p) => (p.id === product.id ? { ...p, qty: nextQty } : p));
      }
      if (prev.reduce((s, it) => s + it.qty, 0) >= CART_TOTAL_MAX) return prev;
      const startQty = clampQtyForTotals(product.id, 1);
      return [...prev, { ...product, qty: startQty }];
    });
  };

  const setQty = (id, qty) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: clampQtyForTotals(id, qty) } : p))
    );
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));

  const clear = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    open,
    setOpen,
    items,
    add,
    setQty,
    remove,
    clear,
    count,
    total,
    PER_ITEM_MAX,
    CART_TOTAL_MAX,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
