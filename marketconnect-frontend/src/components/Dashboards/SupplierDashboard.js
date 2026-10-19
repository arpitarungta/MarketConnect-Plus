// SupplierDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser as getUserUtil, clearToken as clearTokenUtil } from "../../utils/auth";
import { get, post } from "../../services/api";

export default function SupplierDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form for new item
  const [form, setForm] = useState({ title: "", price: "", stock: "", unit: "kg" });
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", stock: "", unit: "kg" });
  const UNITS = ["kg", "g", "pcs", "l", "ml"];
  const [topItems, setTopItems] = useState([]);

  // load user
  useEffect(() => {
    let u = null;
    try { u = typeof getUserUtil === "function" ? getUserUtil() : null; } catch (e) { u = null; }
    if (!u) {
      try { u = JSON.parse(localStorage.getItem("user") || "null"); } catch (e) { u = null; }
    }
    setUser(u);
    setChecking(false);
  }, []);

  function normalizeRole(u) {
    if (!u) return null;
    if (u.role) return String(u.role).toLowerCase();
    if (Array.isArray(u.roles) && u.roles.length) return String(u.roles[0]).toLowerCase();
    return null;
  }

  function logoutAndGoToLogin(targetRoleLoginPath = "/login/supplier") {
    try {
      if (typeof clearTokenUtil === "function") clearTokenUtil();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) { }
    nav(targetRoleLoginPath, { replace: true });
  }

  // load dashboard & items
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      if (normalizeRole(user) !== "supplier") return;

      setLoading(true);
      setError("");
      try {
        const [dashRes, itemsRes, ordersRes] = await Promise.all([get("/supplier/dashboard"), get("/supplier/items"), get("/orders/supplier")]);
        if (!mounted) return;

        const fetchedOrders = Array.isArray(ordersRes) ? ordersRes : [];
        const fetchedItems = itemsRes?.items || itemsRes?.data || [];
        setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
  async function loadTopItems() {
    try {
      const res = await get("/items/top-selling");
      setTopItems(res.items || []);
    } catch (err) {
      console.error("Top items error", err);
    }
  }

  loadTopItems();
}, []);

  if (checking) return <div style={{ padding: 24 }}>Loading…</div>;

  const token = localStorage.getItem("token");
  const role = normalizeRole(user);
  if (!token || !user) { nav("/login/supplier", { replace: true }); return null; }

  if (role !== "supplier") {
    // Mirror VendorDashboard's style/message for role mismatch
    return (
      <div style={{ padding: 32 }}>
        <h3 style={{ color: "#6b7280" }}>
          You are logged in as <strong >Supplier</strong>.
        </h3>
        <div style={{ marginTop: 18 }}>
          <button className="btn mc-btn-primary" onClick={() => logoutAndGoToLogin("/login/vendor")}>
            Logout & Login as vendor
          </button>
        </div>
      </div>
    );
  }

  // create item
  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    if (!form.title.trim()) { setError("Item name required"); setSaving(false); return; }
    if (!form.price) { setError("Price required"); setSaving(false); return; }
    if (!form.stock) { setError("Stock required"); setSaving(false); return; }

    try {
      const payload = { title: form.title.trim(), price: Number(form.price), stock: Number(form.stock), unit: form.unit };
      const res = await post("/supplier/items", payload);
      const created = res?.item || res;
      if (created && created.id) {
        setItems(prev => [created, ...prev]);
      } else {
        // fallback: reload items
        const itemsRes = await get("/supplier/items");
        const fetchedItems = itemsRes?.items || itemsRes?.data || [];
        setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
      }
      setForm({ title: "", price: "", stock: "", unit: "kg" });
    } catch (err) {
      console.error("Add item failed", err);
      setError("Failed to add item");
    } finally {
      setSaving(false);
    }
  }

  // delete item
  async function handleDelete(itemId) {
    const ok = window.confirm("Delete this item?");
    if (!ok) return;

    const token = localStorage.getItem("token");
    // optimistic removal
    const prev = items.slice();
    setItems(prevItems => prevItems.filter(it => it.id !== itemId));
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/supplier/items/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.msg || `Delete failed (${res.status})`);
      }
      // success
    } catch (err) {
      console.error("Delete failed", err);
      setError("Delete failed: " + (err.message || ""));
      setItems(prev); // rollback
    }
  }

  // start editing
  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({ title: item.title || "", price: item.price || "", stock: item.stock || "", unit: item.unit || "kg" });
  }

  // cancel edit
  function cancelEdit() {
    setEditingId(null);
    setEditForm({ title: "", price: "", stock: "", unit: "kg" });
  }

  // save edit
  async function saveEdit(itemId) {
    setError("");
    const token = localStorage.getItem("token");
    if (!editForm.title.trim()) { setError("Item name required"); return; }
    if (!editForm.price) { setError("Price required"); return; }
    if (!editForm.stock) { setError("Stock required"); return; }

    // optimistic update
    const prevItems = items.slice();
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, title: editForm.title, price: Number(editForm.price), stock: Number(editForm.stock), unit: editForm.unit } : it));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/supplier/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ title: editForm.title.trim(), price: Number(editForm.price), stock: Number(editForm.stock), unit: editForm.unit })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.msg || `Update failed (${res.status})`);
      }
      const body = await res.json().catch(() => null);
      // if backend returned item, replace it
      if (body?.item) {
        setItems(prev => prev.map(it => it.id === itemId ? body.item : it));
      }
      setEditingId(null);
    } catch (err) {
      console.error("Update failed", err);
      setError("Update failed: " + (err.message || ""));
      setItems(prevItems); // rollback
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p>Your Supplier Dashboard</p>
        </div>
      </div>
      <div style={{
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginBottom: "15px"
      }}>
        <Link className="mc-btn-primary" to="/supplier/report">Weekly Report</Link>
        <Link className="mc-btn-primary" to="/supplier/orders">Orders</Link>
        <Link className="mc-btn-primary" to="/profile">Profile</Link>
      </div>
      {/* KPI section: Items, Orders, Total Amount */}
      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 15,
        }}
      >
        <div className="mc-card">
          <div className="kpi">{items.length}</div>
          <div className="kpi-sub">Items</div>
        </div>

        <div className="mc-card">
          <div className="kpi">{orders.length}</div>
          <div className="kpi-sub">Orders</div>
        </div>

        <div className="mc-card">
          <div className="kpi">
            ₹{
              orders
                .filter(o => o.status === "DELIVERED")
                .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
            }
          </div>
          <div className="kpi-sub">Total Amount</div>
        </div>
      </div>
      
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h3>Your Top Selling Items</h3>

        {topItems.length === 0 ? (
          <p className="text-muted">No sales yet</p>
        ) : (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {topItems.map((item, index) => (
              <div key={item.id} className="mc-card" style={{ flex: 1 }}>
                <strong>{index + 1}. {item.title}</strong>

                <div className="text-muted">
                  ₹{item.price} per {item.unit}
                </div>

                <div style={{ marginTop: 6 }}>
                  <span className="mc-badge">
                    Sold: {item.total_sold}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add item */}
      <div className="mc-card" style={{ marginTop: 25, padding: 20 }}>
        <h3>Add Item</h3>
        <form onSubmit={handleAdd} style={{ display: "grid", gap: 10, maxWidth: 700 }}>
          <input className="form-control" placeholder="Name of item" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div style={{ display: "flex", gap: 10 }}>
            <input className="form-control" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <select className="form-control" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="form-control" placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            <select className="form-control" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          {error && <div style={{ color: "crimson" }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="mc-btn-primary" disabled={saving}>{saving ? "Saving..." : "Add Item"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm({ title: "", price: "", stock: "", unit: "kg" })}>Reset</button>
          </div>
        </form>
      </div>

      {/* Items list */}
      <div className="mc-card" style={{ marginTop: 25, padding: 20 }}>
        <h3>Your Items</h3>
        {loading ? <div>Loading...</div> : items.length === 0 ? <div>No items yet.</div> : (
          <div style={{ display: "grid", gap: 15 }}>
            {items.map(i => (
              <div key={i.id} className="mc-card" style={{ padding: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  {editingId === i.id ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      <input className="form-control" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="form-control" type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                        <select className="form-control" value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="form-control" type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                        <select className="form-control" value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 700 }}>{i.title}</div>
                      <div className="text-muted">₹{i.price} per {i.unit}</div>
                      <div className="text-muted">Stock: {i.stock} {i.unit}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                  {editingId === i.id ? (
                    <>
                      <button className="mc-btn-primary" onClick={() => saveEdit(i.id)}>Save</button>
                      <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-outline-primary" onClick={() => startEdit(i)}>Edit</button>
                      <button className="btn btn-destructive" onClick={() => handleDelete(i.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
