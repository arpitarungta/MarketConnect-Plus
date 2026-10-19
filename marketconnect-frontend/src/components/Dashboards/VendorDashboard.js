import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser as getUserUtil, clearToken as clearTokenUtil } from "../../utils/auth";
import { get } from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function VendorDashboard() {
  // 🔥 PLACE ORDER FUNCTION (SUPPLIER WISE)
  async function placeOrder(supplierId, supplierCart) {
    nav("/vendor/checkout", {
      state: { supplierId, supplierCart }
    });
  }

  const nav = useNavigate();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState({
  buyAgain: [],
  frequent: [],
  similar: []
});
  // 🛒 CART FROM CONTEXT
  const { cart, addToCart, increaseQty, decreaseQty, supplierTotal, clearSupplierCart } = useCart();

  /* ---------- AUTH ---------- */
  useEffect(() => {
    let u = null;
    try {
      u = typeof getUserUtil === "function" ? getUserUtil() : null;
    } catch { }
    if (!u) {
      try {
        u = JSON.parse(localStorage.getItem("user") || "null");
      } catch { }
    }
    setUser(u);
    setChecking(false);
  }, []);

  function normalizeRole(u) {
    if (!u) return null;
    if (u.role) return String(u.role).toLowerCase();
    return null;
  }

  // eslint-disable-next-line no-unused-vars
  function logoutAndGoToLogin() {
    clearTokenUtil();
    nav("/login/vendor", { replace: true });
  }

  /* ---------- LOAD DASHBOARD DATA ---------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user || normalizeRole(user) !== "vendor") return;

      setLoading(true);
      setError("");
      try {
        const [vdRes, ordRes] = await Promise.all([
          get("/vendor/dashboard"),
          get("/orders/vendor").catch(() => ([]))
        ]);

        if (!mounted) return;

        setSuppliers(vdRes?.supplierList || []);
        setOrders(Array.isArray(ordRes) ? ordRes : []);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
  async function loadRecommendations() {
    try {
      const res = await get("/recommendations");
      setRecommendations({
        buyAgain: res.buyAgain || [],
        frequent: res.frequent || [],
        similar: res.similar || []
      });
    } catch (err) {
      console.error("Recommendation error", err);
    }
  }

  loadRecommendations();
}, []);

  if (checking) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return null;

  const role = normalizeRole(user);

  if (role !== "vendor") {
    return (
      <div style={{ padding: 32 }}>
        <h3 style={{ color: "#6b7280" }}>
          You are logged in as <strong>Vendor</strong>.
        </h3>
        <div style={{ marginTop: 18 }}>
          <button
            className="btn mc-btn-primary"
            onClick={() => {
              clearTokenUtil();
              nav("/login/supplier", { replace: true });
            }}
          >
            Logout & Login as Supplier
          </button>
        </div>
      </div>
    );
  }

  function ItemCard({ item }) {
  const { addToCart } = useCart();

  return (
    <div className="mc-card">
      <strong>{item.title}</strong>

      <div className="text-muted">
        ₹{item.price} per {item.unit}
      </div>

      <div style={{ marginTop: 6 }}>
        <span className="mc-badge">
          Supplier: {item.supplier_name}
        </span>
      </div>

      <button
        className="mc-btn-primary"
        style={{ marginTop: 8 }}
        onClick={() =>
          addToCart(
            item,
            1,
            item.unit,
            item.supplier_id,
            item.supplier_name
          )
        }
      >
        Add
      </button>
    </div>
  );
}

  return (
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <h1>Welcome, {user.name}</h1>
      <p className="text-muted">Your Vendor Dashboard</p>

      <div style={{
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginBottom: "15px"
      }}>
        <Link to="/vendor/suppliers" className="mc-btn-primary">
          🔍 Search Suppliers
        </Link>
        <Link to="/vendor/search" className="mc-btn-primary">
          🔍 Search Items
        </Link>
        <Link to="/vendor/orders" className="mc-btn-primary">
          Order History
        </Link>

        <Link to="/profile" className="mc-btn-primary">
          Profile
        </Link>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginTop: 12
        }}
      >
        <div className="mc-card">
          <div className="kpi">{orders.length}</div>
          <div className="kpi-sub">Total Orders</div>
        </div>

        <div className="mc-card">
          <div className="kpi">{suppliers.length}</div>
          <div className="kpi-sub">Suppliers</div>
        </div>
      </div>

      {/* 🔥 RECOMMENDATIONS */}
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h3>✨ Recommendations</h3>

        {/* 🔁 BUY AGAIN */}
        <h5 style={{ marginTop: 10 }}>Based on Your Previous Orders</h5>

        {recommendations.buyAgain.length === 0 ? (
          <p className="text-muted">No previous orders yet</p>
        ) : (
          <div className="grid">
            {recommendations.buyAgain.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* 🔥 FREQUENT */}
        <h5 style={{ marginTop: 20 }}> Most Bought items by You</h5>

        {recommendations.frequent.length === 0 ? (
          <p className="text-muted">Start ordering to see your favorites</p>
        ) : (
          <div className="grid">
            {recommendations.frequent.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* 🧩 SIMILAR */}
        <h5 style={{ marginTop: 20 }}>Items You May Also Like</h5>

        {recommendations.similar.length === 0 ? (
          <p className="text-muted">No similar items yet</p>
        ) : (
          <div className="grid">
            {recommendations.similar.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>


      {/* SUPPLIERS LIST */}
      <div className="mc-card" style={{ marginTop: 18 }}>
        <h3>Suppliers</h3>

        {loading ? (
          <p>Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p>No suppliers found</p>
        ) : (
          suppliers.map(s => (
            <div
              key={s.id}
              className="mc-card"
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <strong>{s.name}</strong>
                <div className="text-muted">{s.email}</div>
              </div>

              <Link
                to={`/vendor/supplier/${s.id}`}
                className="mc-btn-primary"
              >
                View Items
              </Link>
            </div>
          ))
        )}
      </div>

      {/* 🛒 CART */}
      <div className="mc-card" style={{ marginTop: 24 }}>
        <h3>🛒 Cart</h3>

        {Object.keys(cart).length === 0 ? (
          <p>No items added</p>
        ) : (
          Object.entries(cart).map(([supplierId, sc]) => {
            // ✅ FINAL FIX: SUPPLIER NAME RESOLUTION
            const supplierName =
              suppliers.find(s => String(s.id) === String(supplierId))?.name
              || sc.supplierName
              || `Supplier ID: ${supplierId}`;


            return (
              <div key={supplierId} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Supplier: {supplierName}
                </div>

                {sc.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6
                    }}
                  >
                    <span>
                      {item.title} — {item.qty} {item.unit}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>₹{item.price * item.qty}</span>

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

                <div
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    marginTop: 6
                  }}
                >
                  Total: ₹{supplierTotal(supplierId)}
                </div>
                <button
                  className="mc-btn-primary"
                  style={{ marginTop: 8 }}
                  onClick={() => placeOrder(supplierId, sc)}
                >
                  Place Order
                </button>

                <hr />
              </div>
            );
          })
        )}
      </div>


    </div>
  );
}
