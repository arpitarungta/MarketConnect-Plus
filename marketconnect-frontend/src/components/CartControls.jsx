import React, { useState } from "react";

export default function CartControls({ item, onAdd }) {
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState(item.unit || "kg");

  function increment() {
    setQty(q => q + 1);
  }

  function decrement() {
    if (qty > 1) setQty(q => q - 1);
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>

      {/* Minus */}
      <button className="btn btn-outline-secondary" onClick={decrement}>−</button>

      {/* Quantity */}
      <strong>{qty}</strong>

      {/* Plus */}
      <button className="btn btn-outline-secondary" onClick={increment}>+</button>

      {/* Unit */}
      <select
        className="form-select"
        style={{ width: 80 }}
        value={unit}
        onChange={e => setUnit(e.target.value)}
      >
        <option value="kg">kg</option>
        <option value="g">g</option>
        <option value="l">l</option>
        <option value="ml">ml</option>
        <option value="pcs">pcs</option>
      </select>

      {/* Add to cart */}
      <button
        className="mc-btn-primary"
        onClick={() => onAdd(item, qty, unit)}
      >
        Add
      </button>
    </div>
  );
}
