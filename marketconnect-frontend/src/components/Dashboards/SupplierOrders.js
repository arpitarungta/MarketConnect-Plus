import React, { useEffect, useState } from "react";
import { get, put } from "../../services/api";
import { getUser } from "../../utils/auth";

export default function SupplierOrders() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const user = getUser();
    const filteredOrders =
        filter === "ALL"
            ? orders
            : orders.filter(o => o.status === filter);

    function loadOrders() {
        get("/orders/supplier")
            .then(res => setOrders(Array.isArray(res) ? res : []))
            .catch(err => console.error(err));
    }

   useEffect(() => {

            // 🔹 LOAD ORDERS
            loadOrders();

            // 🔹 LOAD REVIEWS
            async function loadReviews() {
                try {
                    const res = await get(`/reviews/${user?.id}`);
                    setReviews(res.reviews);
                    setAvgRating(res.avgRating);
                } catch (err) {
                    console.error(err);
                }
            }

            if (user) loadReviews();

            // 🔹 AUTO REFRESH ORDERS
            const interval = setInterval(() => {
                loadOrders();
            }, 30000);

            return () => clearInterval(interval);

        }, [user]);


    return (
        <div style={{ padding: 24 }}>
            <h2>📦 Orders Received</h2>

            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <div></div>  {/* left empty space */}

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label><b>Filter:</b></label>

                    <div style={{ position: "relative" }}>
                        <select
                            className="form-control"
                            style={{
                                width: 220,
                                appearance: "none",
                                paddingRight: 30
                            }}
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Orders</option>
                            <option value="PLACED">Placed Orders</option>
                            <option value="ACCEPTED">Accepted Orders</option>
                            <option value="DISPATCHED">Dispatched Orders</option>
                            <option value="DELIVERED">Delivered Orders</option>
                            <option value="CANCELLED">Cancelled Orders</option>
                        </select>

                        {/* chota arrow icon */}
                        <span
                            style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none"
                            }}
                        >
                            ▼
                        </span>
                    </div>

                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="mc-card" style={{ marginTop: 20, textAlign: "center", padding: 20 }}>
                    <p style={{ fontWeight: 600 }}>
                        No orders yet
                    </p>
                </div>
            ) : (
                filteredOrders.map(o => (
                <div
                    key={o.id}
                    className="mc-card"
                    style={{ marginTop: 15, padding: 15 }}
                >

                    {/* 🔹 ORDER DETAILS */}
                    <p><b>Vendor:</b> {o.vendor_name}</p>
                    <p><b>Address:</b> {o.vendor_address}</p>
                    <p><b>Amount:</b> ₹{o.total_amount}</p>
                    <p>
                    <b>Ordered On:</b>{" "}
                    {o.created_at
                        ? new Date(o.created_at.replace(" ", "T")).toLocaleString("en-IN")
                        : "N/A"}
                    </p>
                    {o.items && (
                    <ul>
                        {o.items.map((it, idx) => (
                        <li key={idx}>
                            {it.title} — {it.quantity} {it.unit}
                        </li>
                        ))}
                    </ul>
                    )}

                    <p>
                    <b>Status:</b>{" "}
                    <span style={{
                        color: o.status === "CANCELLED" ? "red" :
                            o.status === "DELIVERED" ? "green" :
                            "orange",
                        fontWeight: "bold"    
                    }}>
                        {o.status}
                    </span>
                    </p>

                    {/* ✅ KEEP BUTTON EXACTLY SAME */}
                    {o.status !== "DELIVERED" && o.status !== "CANCELLED" && (
                    <button
                        className="mc-btn-primary"
                        onClick={() =>
                        put("/orders/status", {
                            orderId: o.id,
                            status:
                            o.status === "PLACED"
                                ? "ACCEPTED"
                                : o.status === "ACCEPTED"
                                ? "DISPATCHED"
                                : "DELIVERED"
                        }).then(() => {
                            setOrders(prev =>
                            prev.map(x =>
                                x.id === o.id
                                ? {
                                    ...x,
                                    status:
                                        x.status === "PLACED"
                                        ? "ACCEPTED"
                                        : x.status === "ACCEPTED"
                                        ? "DISPATCHED"
                                        : "DELIVERED"
                                    }
                                : x
                            )
                            );
                        })
                        }
                    >
                        Update Status
                    </button>
                    )}

                    {/* ⭐ ADD REVIEW ONLY BELOW — DO NOT TOUCH BUTTON */}
                    {o.status === "DELIVERED" && (
                    <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 10 }}>
                        <strong>Review:</strong>

                        {reviews
                        .filter(r => r.order_id === o.id)
                        .map(r => (
                            <div key={r.id}>
                            {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                            <p className="text-muted">{r.feedback}</p>
                            </div>
                        ))}

                        {reviews.filter(r => r.order_id === o.id).length === 0 && (
                        <p className="text-muted">No review yet</p>
                        )}
                    </div>
                    )}

                </div>
                ))
            )}
        </div>
        
    );
}
