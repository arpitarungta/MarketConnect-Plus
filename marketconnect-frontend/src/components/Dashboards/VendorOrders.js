import React, { useEffect, useState } from "react";
import { get, put } from "../../services/api";
import StarRating from "../StarRating";
import { post } from "../../services/api";
import { getUser } from "../../utils/auth";

export default function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [reviewData, setReviewData] = useState({});
    const [reviews, setReviews] = useState([]);
    const user = getUser();

    async function cancelOrder(id) {
        if (!window.confirm("Are you sure you want to cancel this order?"))
            return;

        try {
            const res = await put(`/orders/cancel/${id}`);

            alert(res.message || "Order Cancelled ❌");

            // ✅ REAL REFRESH FROM DB
            const fresh = await get("/orders/vendor");
            setOrders(Array.isArray(fresh) ? fresh : []);

        } catch (err) {
            console.log("Cancel API Error:", err?.response);
            alert(err?.response?.data?.message || "Cancel failed from backend");
        }
    }

    const filteredOrders =
        filter === "ALL"
            ? orders
            : orders.filter(o => o.status === filter);


    useEffect(() => {

    // 🔹 LOAD ORDERS
        get("/orders/vendor")
            .then(res => setOrders(Array.isArray(res) ? res : []))
            .catch(err => console.log(err));
        // 🔹 LOAD REVIEWS
        async function loadReviews() {
            try {
                const res = await get(`/reviews/vendor/${user.id}`);
                setReviews(res.reviews);
            } catch (err) {
                console.log(err);
            }
        }
        if (user) loadReviews();
    }, [user]);  // ✅ IMPORTANT

    return (
        <div style={{ padding: 24 }}>
            <h2>📜 Order History</h2>

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

                filteredOrders.map(o => {
                    const orderReview = reviews.find(r => r.order_id === o.id);
                    return (
                    <div key={o.id} className="mc-card" style={{ marginTop: 12 }}>
                        <h4>Order </h4>
                        <p><b>Supplier:</b> {o.supplier_name}</p>
                        <p><b>Amount:</b> ₹{o.total_amount}</p>
                        <p>
                        <b>Ordered On:</b>{" "}
                        {o.created_at
                            ? new Date(o.created_at.replace(" ", "T")).toLocaleString("en-IN")
                            : "N/A"}
                        </p>
                        {o.items && o.items.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                                <b>Items:</b>
                                <ul style={{ marginTop: 6 }}>
                                    {o.items.map((it, i) => (
                                        <li key={i}>
                                            {it.title} — {it.quantity} {it.unit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                            <p style={{ margin: 0 }}>
                                <b>Status:</b> {o.status}
                            </p>
                            {(o.status === "PLACED" || o.status === "ACCEPTED") && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => cancelOrder(o.id)}
                                >
                                    Cancel Order
                                </button>
                            )}
                            {o.status === "DELIVERED" && (
                            <div style={{ marginTop: 10 }}>

                                {orderReview && !reviewData[o.id]?.editMode ? (
                                // ✅ SHOW EXISTING REVIEW
                                <div style={{ marginTop: 12 }}>

                                    <div style={{
                                        borderTop: "1px solid rgba(0,0,0,0.08)",
                                        paddingTop: 10
                                    }}>

                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                        ⭐ Your Review
                                        </div>

                                        <div style={{ fontSize: 16 }}>
                                        {"★".repeat(orderReview.rating)}
                                        {"☆".repeat(5 - orderReview.rating)}
                                        </div>

                                        <p className="text-muted" style={{ marginTop: 4 }}>
                                        {orderReview.feedback}
                                        </p>

                                        <button
                                        className="mc-btn-primary"
                                        style={{ marginTop: 8 }}
                                        onClick={() => {
                                            setReviewData(prev => ({
                                                ...prev,
                                                [o.id]: {
                                                    rating: orderReview.rating,
                                                    feedback: orderReview.feedback,
                                                    editMode: true
                                                }
                                            }));
                                        }}
                                                                                >
                                        Edit Review
                                        </button>

                                    </div>

                                    </div>

                                ) : (
                                // ✅ SHOW GIVE REVIEW
                                <div>
                                    <h4>Give Review</h4>

                                    <StarRating
                                    rating={reviewData[o.id]?.rating || 0}
                                    setRating={(value) =>
                                        setReviewData(prev => ({
                                        ...prev,
                                        [o.id]: {
                                            ...prev[o.id],
                                            rating: value
                                        }
                                        }))
                                    }
                                    />

                                    <textarea
                                    className="form-control"
                                    placeholder="Write feedback..."
                                    value={reviewData[o.id]?.feedback || ""}
                                    onChange={(e) =>
                                        setReviewData(prev => ({
                                        ...prev,
                                        [o.id]: {
                                            ...prev[o.id],
                                            feedback: e.target.value
                                        }
                                        }))
                                    }
                                    />

                                    <button
                                    className="mc-btn-primary"
                                    onClick={async () => {
                                        const data = reviewData[o.id];

                                        await post("/reviews", {
                                        supplierId: o.supplier_id,
                                        orderId: o.id,
                                        rating: data?.rating,
                                        feedback: data?.feedback || ""
                                        });

                                        alert("Review submitted ✅");

                                        // 🔥 refresh reviews
                                        const res = await get(`/reviews/${user.id}`);
                                        setReviews(res.reviews);
                                        setReviewData(prev => ({
                                            ...prev,
                                            [o.id]: {
                                                rating: 0,
                                                feedback: "",
                                                editMode: false
                                            }
                                        }));
                                    }}
                                    >
                                    Submit Review
                                    
                                    </button>
                                </div>
                                )}

                            </div>
                            )}
                    </div>
                    );
                })
            )}
        </div>
    );
}
