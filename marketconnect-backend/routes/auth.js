// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, address, pincode } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ msg: 'Missing fields' });
    if (!['vendor','supplier'].includes(role)) return res.status(400).json({ msg: 'Invalid role' });

    // check exists
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(400).json({ msg: 'Email already registered' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await db.query(
   'INSERT INTO users (name, email, phone, password_hash, role, address, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, hash, role, address || null, pincode || null]
    );

    res.json({ msg: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ msg: 'Missing email/phone or password' });
    }

    // 🔍 SEARCH USER
    const [rows] = await db.query(
      `SELECT id, name, email, phone, password_hash, role, address, pincode
       FROM users 
       WHERE email = ? OR phone = ?`,
      [identifier, identifier]
    );

    // ❌ CASE 1: USER NOT FOUND (important for deleted account)
    if (!rows.length) {
      return res.status(404).json({
        msg: 'No account found with this email or phone'
      });
    }

    const user = rows[0];

    // ❌ CASE 2: WRONG PASSWORD
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        msg: 'Incorrect password'
      });
    }

    // ✅ SUCCESS
    const payload = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      address: user.address,
      pincode: user.pincode
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: payload });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

const auth = require("./middleware/authMiddleware");

router.put("/update", auth, async (req, res) => {
  try {
    const { name, phone, address, pincode } = req.body;
    const userId = req.user.id;

    await db.execute(
      "UPDATE users SET name=?, phone=?, address=?, pincode=? WHERE id=?",
      [name, phone, address, pincode, userId]
    );

    res.json({ msg: "Profile updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE ACCOUNT
router.delete('/delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;
    const role = decoded.role;

    // 🔍 Check current user exists
    const [userRows] = await db.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔴 DELETE LOGIC

    if (role === "vendor") {
      // delete vendor order_items first
      await db.execute(`
        DELETE oi FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.vendor_id = ?
      `, [userId]);

      // delete vendor orders
      await db.execute(
        "DELETE FROM orders WHERE vendor_id = ?",
        [userId]
      );
    }

    if (role === "supplier") {
      // delete supplier order_items
      await db.execute(`
        DELETE oi FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.supplier_id = ?
      `, [userId]);

      // delete supplier orders
      await db.execute(
        "DELETE FROM orders WHERE supplier_id = ?",
        [userId]
      );

      // delete supplier items
      await db.execute(
        "DELETE FROM items WHERE supplier_id = ?",
        [userId]
      );
    }

    // finally delete user
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ msg: "Account deleted successfully ✅" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Server error while deleting account" });
  }
});

module.exports = router;