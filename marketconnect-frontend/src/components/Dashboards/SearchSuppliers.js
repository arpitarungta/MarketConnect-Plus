import React, { useState } from "react";
import { get } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function SearchSuppliers() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const nav = useNavigate();
  const [searched, setSearched] = useState(false);

    async function handleSearch() {
    setSearched(true); // 🔥 important

    try {
        const res = await get("/vendor/dashboard");

        const suppliers = res?.supplierList || [];

        const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
        );

        setResults(filtered);

    } catch (err) {
        console.error(err);
    }
    }

  return (
    <div className="container">

      {/* 🔍 HEADER */}
      <div className="mc-card" style={{ marginBottom: 20 }}>
        <h2 className="h-gradient">🔍 Search Suppliers</h2>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search supplier..."
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

      {/* 🔍 RESULTS */}
      {!searched ? (
        <div className="mc-card" style={{ textAlign: "center" }}>
            <p className="text-muted">Search to find suppliers</p>
        </div>
        ) : results.length === 0 ? (
        <div className="mc-card" style={{ textAlign: "center" }}>
            <p className="text-muted">No suppliers found</p>
        </div>
        ) : (
        results.map((s) => (
            <div
            key={s.id}
            className="mc-card"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12
            }}
            >
            <div>
                <h3 style={{ marginBottom: 4 }}>{s.name}</h3>
                <div className="text-muted">{s.email}</div>
            </div>

            <button
                className="mc-btn-primary"
                onClick={() => nav(`/vendor/supplier/${s.id}`)}
            >
                View Items
            </button>
            </div>
        ))
        )}

    </div>
  );
}