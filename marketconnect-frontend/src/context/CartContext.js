import React, { createContext, useContext, useEffect, useState } from "react";
const CartContext = createContext();

export function CartProvider({ children }) {

  // 🔹 LOAD CART FROM LOCALSTORAGE
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("vendor_cart");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 🔹 SAVE CART TO LOCALSTORAGE ON EVERY CHANGE
  useEffect(() => {
    localStorage.setItem("vendor_cart", JSON.stringify(cart));
  }, [cart]);

  /* ---------------- ADD TO CART ---------------- */
  function addToCart(item, qty, unit, supplierId, supplierName) {
    setCart(prev => {
      const supplierCart = prev[supplierId] || {
        supplierName: supplierName || "Unknown Supplier",
        items: []
      };

      const existing = supplierCart.items.find(
        i => i.id === item.id && i.unit === unit
      );

      let updatedItems;
      if (existing) {
        updatedItems = supplierCart.items.map(i =>
          i.id === item.id && i.unit === unit
            ? { ...i, qty: i.qty + qty }
            : i
        );
      } else {
        updatedItems = [
          ...supplierCart.items,
          {
            id: item.id,
            title: item.title,
            price: item.price,
            qty,
            unit
          }
        ];
      }

      return {
        ...prev,
        [supplierId]: {
          supplierName: supplierName || supplierCart.supplierName,
          items: updatedItems
        }
      };
    });
  }

  /* ---------------- QTY CONTROLS ---------------- */
  function increaseQty(supplierId, index) {
    setCart(prev => {
      const sc = prev[supplierId];
      if (!sc) return prev;

      const items = sc.items.map((i, idx) =>
        idx === index ? { ...i, qty: i.qty + 1 } : i
      );

      return { ...prev, [supplierId]: { ...sc, items } };
    });
  }

  function decreaseQty(supplierId, index) {
    setCart(prev => {
      const sc = prev[supplierId];
      if (!sc) return prev;

      const items = sc.items
        .map((i, idx) =>
          idx === index ? { ...i, qty: i.qty - 1 } : i
        )
        .filter(i => i.qty > 0);

      if (items.length === 0) {
        const copy = { ...prev };
        delete copy[supplierId];
        return copy;
      }

      return { ...prev, [supplierId]: { ...sc, items } };
    });
  }

  /* ---------------- TOTALS ---------------- */
  function supplierTotal(supplierId) {
    const sc = cart[supplierId];
    if (!sc) return 0;
    return sc.items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  /* ---------------- MANUAL CLEAR (OPTIONAL) ---------------- */
  function clearCart() {
    setCart({});
    localStorage.removeItem("vendor_cart");
  }

  function clearSupplierCart(supplierId) {
    setCart(prev => {
      const updated = { ...prev };
      delete updated[supplierId];
      return updated;
    });
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        supplierTotal,
        clearSupplierCart,
        clearCart   // 👈 use only when user clicks "Clear Cart"
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
