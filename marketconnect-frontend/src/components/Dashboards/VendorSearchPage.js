import React, { useState } from "react";
import { get } from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function VendorSearchPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState({});
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
  setSearched(true); // 🔥 important

  try {
    const res = await get(`/items/search?query=${search}`);
    setResults(res);
  } catch (err) {
    console.error(err);
  }
}

  return (
    <div className="container">

      {/* 🔍 HEADER */}
      <div className="mc-card" style={{ marginBottom: 20 }}>
        <h2 className="h-gradient">🔍 Search Items</h2>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="mc-btn-primary"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      {/* 🔎 RESULTS */}
      {!searched ? null : results.length === 0 ? (
        <div className="mc-card" style={{ textAlign: "center" }}>
          <p className="text-muted">No items found</p>
        </div>
      ) : (
        results.map((item) => (
          <div
            key={item.id}
            className="mc-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12
            }}
          >
            {/* LEFT SIDE */}
            <div>
              <h3 style={{ marginBottom: 4 }}>{item.title}</h3>

              <div className="text-muted">
                ₹{item.price} per {item.unit}
              </div>

              <div style={{ marginTop: 6 }}>
                <span className="mc-badge">
                  Supplier: {item.supplier_name}
                </span>
              </div>
            </div>

            {/* RIGHT SIDE BUTTON */}
            {addedItems[item.id] ? (
                <button
                    className="mc-btn-primary"
                    onClick={() => window.location.href = "/vendor/dashboard"}
                >
                    Go to Cart
                </button>
                ) : (
                <button
                    className="mc-btn-primary"
                    onClick={() => {
                    addToCart(
                        item,
                        1,
                        item.unit,
                        item.supplier_id,
                        item.supplier_name
                    );

                    setAddedItems(prev => ({
                        ...prev,
                        [item.id]: true
                    }));
                    }}
                >
                    Add
                </button>
                )}
          </div>
        ))
      )}

    </div>
  );
}