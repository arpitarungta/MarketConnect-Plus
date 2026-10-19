import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { get, post } from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function VendorSupplierPage() {
  const { supplierId } = useParams();
  const nav = useNavigate();

  // 🛒 CART CONTEXT
  const {
    cart,
    addToCart,
    increaseQty,
    decreaseQty,
    supplierTotal
  } = useCart();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supplierName, setSupplierName] = useState("");

  /* ---------------- LOAD SUPPLIER ITEMS ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await get(`/suppliers/${supplierId}/items`);

        setItems(res.items || []);

        // ✅ supplier ka real name
        if (res.supplier?.name) {
          setSupplierName(res.supplier.name);
        }
      } catch (err) {
        console.error("Failed to load supplier items", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supplierId]);

  /* ---------------- PLACE ORDER (SUPPLIER ONLY) ---------------- */
  function goToCheckout() {
    const sc = cart[supplierId];

    if (!sc || sc.items.length === 0) {
      alert("Cart is empty");
      return;
    }

    nav("/vendor/checkout", {
      state: {
        supplierId,
        supplierCart: sc,
        supplierName
      }
    });
  }


  return (
    <div style={{ padding: 24 }}>
      {/* 🔙 BACK */}
      <Link to="/vendor/dashboard">← Back to Suppliers</Link>

      <h2 style={{ marginTop: 10 }}>
        {supplierName || "Supplier"} Items
      </h2>

      {/* ---------------- ITEMS LIST ---------------- */}
      {loading ? (
        <p>Loading items...</p>
      ) : items.length === 0 ? (
        <p>No items available</p>
      ) : (
        items.map(it => (
          <div
            key={it.id}
            className="mc-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
              padding: 14
            }}
          >
            <div>
              <strong>{it.title}</strong>
              <div className="text-muted">
                ₹{it.price} per {it.unit}
              </div>
            </div>

            <button
              className="mc-btn-primary"
              onClick={() =>
                addToCart(
                  it,
                  1,
                  it.unit,
                  supplierId,
                  supplierName   // ✅ REAL NAME PASSED
                )
              }
            >
              Add
            </button>
          </div>
        ))
      )}

      {/* ---------------- SUPPLIER CART ---------------- */}
      <div className="mc-card" style={{ marginTop: 24 }}>
        <h3>🛒 Cart</h3>

        {!cart[supplierId] ? (
          <p>No items added</p>
        ) : (
          <>
            {cart[supplierId].items.map((c, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8
                }}
              >
                <span>
                  {c.title} — {c.qty} {c.unit}
                </span>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <strong>₹{c.price * c.qty}</strong>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => decreaseQty(supplierId, index)}
                  >
                    −
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => increaseQty(supplierId, index)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <hr />

            <div style={{ textAlign: "right", fontWeight: 600 }}>
              Total: ₹{supplierTotal(supplierId)}
            </div>

            {/* ✅ PLACE ORDER BUTTON */}
            <button
              className="mc-btn-primary"
              style={{ marginTop: 12, float: "right" }}
              onClick={goToCheckout}
            >
              Place Order
            </button>

          </>
        )}
      </div>
    </div>
  );
}
