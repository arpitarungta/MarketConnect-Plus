const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("./middleware/authMiddleware");

// Weekly report for supplier
router.get("/weekly", auth, async (req, res) => {
  try {
    const supplierId = req.user.id;

    // 🟢 Top selling items
    const [items] = await db.execute(`
      SELECT i.title, SUM(oi.quantity) as totalSold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN items i ON oi.item_id = i.id
      WHERE o.supplier_id = ? 
      AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY i.title
      ORDER BY totalSold DESC
    `, [supplierId]);

    // 🟢 Earnings
    const [earnings] = await db.execute(`
      SELECT SUM(total_amount) as totalEarnings
      FROM orders
      WHERE supplier_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, [supplierId]);

    // 🟢 Orders per day
    const [orders] = await db.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as totalOrders
      FROM orders
      WHERE supplier_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
    `, [supplierId]);

    res.json({
      items,
      earnings: earnings[0].totalEarnings || 0,
      orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;