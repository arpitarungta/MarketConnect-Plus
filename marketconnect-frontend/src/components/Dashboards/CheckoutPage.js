import { getUser } from "../../utils/auth";
import { useEffect } from "react";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { post } from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function CheckoutPage() {
  const nav = useNavigate();
  const location = useLocation();

  const { supplierId, supplierCart } = location.state || {};
  const { supplierTotal, clearSupplierCart } = useCart();

  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const [altAddress, setAltAddress] = useState("");
  const [altPincode, setAltPincode] = useState("");

  const [useAlt, setUseAlt] = useState(false);
  const [payment, setPayment] = useState("COD");

  useEffect(() => {
    const user = getUser();

    if (user) {
      setAddress(user.address || "");
      setPincode(user.pincode || "");
    }
  }, []);

  if (!supplierId) {
    return <p>No order data found</p>;
  }

  async function confirmOrder() {
    
    const finalAddress = useAlt ? altAddress : address;
    const finalPincode = useAlt ? altPincode : pincode;

    if (!finalAddress || !finalPincode) {
      alert("Please enter address and pincode");
      return;
    }

    const payload = {
      supplierId,
      vendorAddress: finalAddress,
      pincode: finalPincode, 
      items: supplierCart.items,
      total: supplierTotal(supplierId),
      paymentMode: payment
    };

    try {
      await post("/orders/place", payload);

      clearSupplierCart(supplierId);

      alert("Order placed successfully ✅");
      nav("/vendor/dashboard");
    } catch {
      alert("Order failed ❌");
    }
  }

  return (
    <div className="mc-card" style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h3>Checkout</h3>

      <label>Delivery Address</label>
<div className="form-control mb-2" style={{ background: "#f8f9fa" }}>
  {address}
</div>

<label>Pincode</label>
<div className="form-control mb-2" style={{ background: "#f8f9fa" }}>
  {pincode}
</div>

      <div style={{ marginTop: 10 }}>
        <input
          type="checkbox"
          checked={useAlt}
          onChange={() => setUseAlt(!useAlt)}
        /> Use different address
      </div>

      {useAlt && (
        <div style={{ marginTop: 10 }}>
          <label>Alternative Address</label>
          <textarea
            className="form-control mb-2"
            value={altAddress}
            onChange={e => setAltAddress(e.target.value)}
            placeholder="Enter alternative address"
          />

          <input
            type="text"
            className="form-control"
            value={altPincode}
            onChange={e => setAltPincode(e.target.value)}
            placeholder="Alternative pincode"
          />
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <label>Payment Mode</label>
        <select
          className="form-control"
          value={payment}
          onChange={e => setPayment(e.target.value)}
        >
          <option value="COD">Cash on Delivery</option>
        </select>
      </div>

      <h4 style={{ marginTop: 10 }}>
        Total: ₹{supplierTotal(supplierId)}
      </h4>

      <button
        className="mc-btn-primary"
        onClick={confirmOrder}
        style={{ marginTop: 10 }}
      >
        Confirm Order
      </button>
    </div>
  );
}
