const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("./middleware/authMiddleware");

// ✅ GET RECOMMENDATIONS
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors allowed" });
    }

    const vendorId = req.user.id;

    // 🔁 1. BUY AGAIN (Recent orders)
    const [pastItems] = await db.execute(`
      SELECT i.*, u.name AS supplier_name, MAX(o.created_at) AS last_order
      FROM items i
      JOIN users u ON i.supplier_id = u.id
      JOIN order_items oi ON i.id = oi.item_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.vendor_id = ?
      GROUP BY i.id
      ORDER BY last_order DESC
      LIMIT 3
    `, [vendorId]);

    // 🔥 2. MOST FREQUENT (Most ordered by vendor)
    const [frequentItems] = await db.execute(`
      SELECT i.*, u.name AS supplier_name, COUNT(*) AS order_count
      FROM items i
      JOIN users u ON i.supplier_id = u.id
      JOIN order_items oi ON i.id = oi.item_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.vendor_id = ?
      GROUP BY i.id
      ORDER BY order_count DESC
      LIMIT 2
    `, [vendorId]);

    // 🧩 3. SIMILAR ITEMS (based on vendor history)

    let similarItems = [];

    const [rows] = await db.execute(`
    SELECT i.*, u.name AS supplier_name
    FROM items i
    JOIN users u ON i.supplier_id = u.id
    WHERE i.id NOT IN (
        SELECT oi.item_id
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.vendor_id = ?
    )
    ORDER BY RAND()
    LIMIT 5
    `, [vendorId]);

    similarItems = rows;


    // 🔥 FALLBACK (ADD HERE)
    if (pastItems.length === 0 && frequentItems.length === 0) {
    const [fallback] = await db.execute(`
        SELECT i.*, u.name AS supplier_name
        FROM items i
        JOIN users u ON i.supplier_id = u.id
        LIMIT 5
    `);

    return res.json({
        buyAgain: fallback,
        frequent: [],
        similar: []
    });
    }

    // ✅ FINAL RESPONSE
    res.json({
      buyAgain: pastItems,
      frequent: frequentItems,
      similar: similarItems
    });

  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

module.exports = router;