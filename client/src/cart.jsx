import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "marwa_cart";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const setQty = (food, qty) =>
      setItems((prev) => {
        const rest = prev.filter((i) => i._id !== food._id);
        if (qty <= 0) return rest;
        const existing = prev.find((i) => i._id === food._id);
        const next = { _id: food._id, name: food.name, price: food.price, image: food.image, qty: Math.min(qty, 50) };
        return existing ? prev.map((i) => (i._id === food._id ? next : i)) : [...prev, next];
      });

    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
      qtyOf: (id) => items.find((i) => i._id === id)?.qty || 0,
      setQty,
      // Keep cart prices/names in sync with the live menu; drop dishes no longer offered.
      syncWithMenu: (foods) =>
        setItems((prev) =>
          prev
            .map((i) => {
              const f = foods.find((x) => x._id === i._id);
              return f ? { ...i, name: f.name, price: f.price, image: f.image } : null;
            })
            .filter(Boolean)
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
