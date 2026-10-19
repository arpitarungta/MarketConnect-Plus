const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("./middleware/authMiddleware.js");

// Vendor places order
router.post("/place", auth, async (req, res) => {
  try {
    const { supplierId, vendorAddress, items, total } = req.body;

    if (!vendorAddress) {
      return res.status(400).json({ message: "Address is required" });
    }

    const vendorId = req.user.id;
    const vendorName = req.user.name;
    // 1️⃣ Insert into orders
    const [orderResult] = await db.execute(
      `INSERT INTO orders 
      (vendor_id, supplier_id, vendor_name, vendor_address, total_amount)
      VALUES (?, ?, ?, ?, ?)`,
      [vendorId, supplierId, vendorName, vendorAddress, total]
    );

    const orderId = orderResult.insertId;

    // 2️⃣ Insert order items
    for (let item of items) {
      await db.execute(
        `INSERT INTO order_items 
        (order_id, item_id, title, price, quantity, unit)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id,
          item.title,
          item.price,
          item.qty,
          item.unit
        ]
      );
    }

    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Supplier - get orders
router.get("/supplier", auth, async (req, res) => {
  try {
    const supplierId = req.user.id;

    const [orders] = await db.execute(
      "SELECT * FROM orders WHERE supplier_id = ? ORDER BY created_at DESC",
      [supplierId]
    );
    for (let order of orders) {
      const [items] = await db.execute(
        "SELECT title, price, quantity, unit FROM order_items WHERE order_id = ?",
        [order.id]
      );

      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Vendor - get orders
router.get("/vendor", auth, async (req, res) => {
  try {
    const vendorId = req.user.id;

    // 1️⃣ Orders + supplier details
    const [orders] = await db.execute(
      `SELECT 
        o.*,
        u.name AS supplier_name,
        u.email AS supplier_email
       FROM orders o
       JOIN users u ON o.supplier_id = u.id
       WHERE o.vendor_id = ?
       ORDER BY o.created_at DESC`,
      [vendorId]
    );

    // 2️⃣ Attach items to each order
    for (let order of orders) {
      const [items] = await db.execute(
        `SELECT title, price, quantity, unit
         FROM order_items
         WHERE order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Supplier - update order status
router.put("/status", auth, async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Order fetch karo
    const [rows] = await db.execute(
      "SELECT status FROM orders WHERE id = ?",
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = rows[0].status;

    // ❌ Business Rule
    const validTransitions = {
      PLACED: ["ACCEPTED"],
      ACCEPTED: ["DISPATCHED"],
      DISPATCHED: ["DELIVERED"]
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        message: "Invalid status transition"
      });
    }


    await db.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ❌ Vendor Cancel Order API
// ❌ Vendor Cancel Order API — FINAL WORKING
router.put("/cancel/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user.id;

    // 🔍 Check order belongs to this vendor
    const [rows] = await db.execute(
      "SELECT status FROM orders WHERE id = ? AND vendor_id = ?",
      [orderId, vendorId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = rows[0].status;

    // ❌ Allow cancel only for early states
    if (!(currentStatus === "PLACED" || currentStatus === "ACCEPTED")) {
      return res.status(400).json({
        message: "Cannot cancel after dispatch"
      });
    }

    await db.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      ["CANCELLED", orderId]
    );

    res.json({ message: "Order cancelled successfully" });

  } catch (err) {
    console.log("CANCEL ERROR =", err.message);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;