const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("./middleware/authMiddleware");

// ✅ ADD REVIEW
router.post("/", auth, async (req, res) => {
  try {
    const { supplierId, orderId, rating, feedback } = req.body;
    const safeFeedback = feedback || "";
    const vendorId = req.user.id;

    // check delivered
    const [rows] = await db.execute(
      "SELECT status FROM orders WHERE id = ? AND vendor_id = ?",
      [orderId, vendorId]
    );

    if (!rows.length || rows[0].status !== "DELIVERED") {
      return res.status(400).json({ message: "Only delivered orders can be reviewed" });
    }

    const [existing] = await db.execute(
        "SELECT id FROM reviews WHERE order_id = ?",
        [orderId]
        );

        if (existing.length > 0) {
        // 🔄 UPDATE existing review
        await db.execute(
            "UPDATE reviews SET rating = ?, feedback = ? WHERE order_id = ?",
            [rating, safeFeedback, orderId]
        );
        } else {
        // ➕ INSERT new review
        await db.execute(
            "INSERT INTO reviews (supplier_id, vendor_id, order_id, rating, feedback) VALUES (?, ?, ?, ?, ?)",
            [supplierId, vendorId, orderId, rating, safeFeedback]
        );
        }

    res.json({ message: "Review submitted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [reviews] = await db.execute(
      "SELECT * FROM reviews WHERE vendor_id = ?",
      [vendorId]
    );

    res.json({ reviews });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET REVIEWS
router.get("/:supplierId", async (req, res) => {
  try {
    const { supplierId } = req.params;

    const [reviews] = await db.execute(
      `SELECT r.*, u.name AS vendor_name, r.order_id
       FROM reviews r
       JOIN users u ON r.vendor_id = u.id
       WHERE r.supplier_id = ?`,
      [supplierId]
    );

    const [avg] = await db.execute(
      "SELECT AVG(rating) as avgRating FROM reviews WHERE supplier_id = ?",
      [supplierId]
    );

    res.json({
      reviews,
      avgRating: avg[0].avgRating || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;