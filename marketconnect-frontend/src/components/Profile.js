import React, { useState } from "react";
import { getUser } from "../utils/auth";
import { put } from "../services/api";

export default function Profile() {
  const user = getUser();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    pincode: user.pincode || ""
  });

  async function saveProfile() {
    try {
      await put("/auth/update", form);

      // update localStorage
      localStorage.setItem("user", JSON.stringify({ ...user, ...form }));

      setEditMode(false);
      alert("Profile updated ✅");
    } catch (err) {
      alert("Update failed ❌");
    }
  }

  return (
    <div className="mc-card" style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>👤 Profile</h2>

      {!editMode ? (
        <>
          <p><b>Name:</b> {form.name}</p>
          <p><b>Email:</b> {form.email}</p>
          <p><b>Phone:</b> {form.phone || "N/A"}</p>
          <p><b>Address:</b> {form.address}</p>
          <p><b>Pincode:</b> {form.pincode}</p>

          <button
            className="mc-btn-primary"
            onClick={() => setEditMode(true)}
          >
            ✏️ Edit Profile
          </button>
        </>
      ) : (
        <>
          <input
            className="form-control mb-2"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
          />

          <input
            className="form-control mb-2"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
          />

          <textarea
            className="form-control mb-2"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Address"
          />

          <input
            className="form-control mb-2"
            value={form.pincode}
            onChange={e => setForm({ ...form, pincode: e.target.value })}
            placeholder="Pincode"
          />

          <button className="mc-btn-primary" onClick={saveProfile}>
            Save
          </button>
        </>
      )}
    </div>
  );
}