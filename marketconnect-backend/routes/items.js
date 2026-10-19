const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("./middleware/authMiddleware");

// 🔍 SEARCH ITEMS
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    const [rows] = await db.execute(
      `SELECT 
        i.*,
        u.name AS supplier_name,
        u.email AS supplier_email
       FROM items i
       JOIN users u ON i.supplier_id = u.id
       WHERE LOWER(i.title) LIKE LOWER(?)`,
      [`%${query}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 TOP SELLING ITEMS (SUPPLIER)
router.get("/top-selling", auth, async (req, res) => {
  try {
    if (req.user.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers allowed" });
    }

    const supplierId = req.user.id;

    const [rows] = await db.execute(`
      SELECT i.id, i.title, i.price, i.unit, SUM(oi.quantity) AS total_sold
      FROM items i
      JOIN order_items oi ON i.id = oi.item_id
      JOIN orders o ON o.id = oi.order_id
      WHERE i.supplier_id = ?
      GROUP BY i.id
      ORDER BY total_sold DESC
      LIMIT 2
    `, [supplierId]);

    res.json({ items: rows });

  } catch (err) {
    console.error("Top selling error:", err);
    res.status(500).json({ message: "Failed to fetch top items" });
  }
});

module.exports = router;