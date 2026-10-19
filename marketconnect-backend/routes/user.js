const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const auth = require("./middleware/authMiddleware");

// Change Password
router.put("/change-password", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    const user = rows[0];

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hash, userId]
    );

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit ticket
router.post("/support", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    await db.query(
      "INSERT INTO support_tickets (user_id, message) VALUES (?, ?)",
      [userId, message]
    );

    res.json({ message: "Issue submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/feedback", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    await db.query(
      "INSERT INTO feedback (user_id, message) VALUES (?, ?)",
      [userId, message]
    );

    res.json({ message: "Feedback submitted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;