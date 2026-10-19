// routes/protected.js
const express = require('express');
const router = express.Router();
const auth = require('./middleware/authMiddleware'); // new file
const db = require('../db');

// VENDOR: get dashboard — list of suppliers (real users with role='supplier')
router.get('/vendor/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Forbidden' });

    const [suppliers] = await db.query(
      `SELECT id, name, email, phone FROM users WHERE role = 'supplier' ORDER BY name ASC`
    );

    // Map to minimal info (frontend can expand)
    const supplierList = (suppliers || []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || null
    }));

    res.json({
      welcome: `Welcome, ${req.user.name}`,
      supplierList,
      message: 'Live supplier list'
    });
  } catch (err) {
    console.error('GET /vendor/dashboard', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// SUPPLIER: get dashboard (items + incoming orders)
// If you don't have orders table yet, orders will be empty.
router.get('/supplier/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') return res.status(403).json({ msg: 'Forbidden' });

    const supplierId = req.user.id;

    // Get items for this supplier
    const [items] = await db.query(
      `SELECT id, title, price, stock, unit, created_at FROM items WHERE supplier_id = ? ORDER BY created_at DESC`,
      [supplierId]
    );

    // Try to fetch orders related to this supplier (if table exists)
    let incomingOrders = [];
    try {
      const [orders] = await db.query(
        `SELECT o.id, o.order_number, o.amount, o.status, o.created_at, v.name AS vendor_name
         FROM orders o
         LEFT JOIN users v ON v.id = o.vendor_id
         WHERE o.supplier_id = ?
         ORDER BY o.created_at DESC
         LIMIT 50`,
        [supplierId]
      );
      incomingOrders = orders;
    } catch (e) {
      // if orders table doesn't exist yet, we ignore and return empty orders
      incomingOrders = [];
    }

    res.json({
      welcome: `Welcome, ${req.user.name}`,
      items: items || [],
      incomingOrders,
      message: 'Supplier dashboard (live data)'
    });
  } catch (err) {
    console.error('GET /supplier/dashboard', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/*
  SUPPLIER ITEM CRUD:
  - GET /supplier/items          => list items by supplier (used by frontend)
  - POST /supplier/items         => create item (enforces ownership)
  - DELETE /supplier/items/:id   => delete (enforces ownership)
  - PUT /supplier/items/:id      => update (enforces ownership) — optional
*/
// GET items for a given supplier id (accessible to vendors and the supplier themself)
router.get('/suppliers/:id/items', auth, async (req, res) => {
  try {
    const callerRole = (req.user.role || '').toString().toLowerCase();
    const callerId = req.user.id;
    const supplierId = Number(req.params.id);

    // allow if caller is vendor OR caller is the supplier themselves OR admin
    if (!(callerRole === 'vendor' || callerRole === 'supplier' || callerRole === 'admin' || callerId === supplierId)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const [items] = await db.query(
      `SELECT id, title, price, stock, unit, created_at
       FROM items
       WHERE supplier_id = ?
       ORDER BY created_at DESC`,
      [supplierId]
    );

    return res.json({ items: items || [] });
  } catch (err) {
    console.error('GET /suppliers/:id/items', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// GET items
router.get('/supplier/items', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') return res.status(403).json({ msg: 'Forbidden' });
    const supplierId = req.user.id;
    const [items] = await db.query(
      `SELECT id, title, price, stock, unit, created_at FROM items WHERE supplier_id = ? ORDER BY created_at DESC`,
      [supplierId]
    );
    res.json({ items: items || [] });
  } catch (err) {
    console.error('GET /supplier/items', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST create item
router.post('/supplier/items', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') return res.status(403).json({ msg: 'Forbidden' });
    const supplierId = req.user.id;
    const { title, price, stock = 0, unit = 'kg' } = req.body;
    if (!title || typeof price === 'undefined') {
      return res.status(400).json({ msg: 'Missing title or price' });
    }

    const [result] = await db.query(
      `INSERT INTO items (supplier_id, title, price, stock, unit, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
      [supplierId, title, price, stock, unit]
    );

    const insertedId = result.insertId;
    const [rows] = await db.query(
      `SELECT id, title, price, stock, unit, created_at FROM items WHERE id = ?`,
      [insertedId]
    );

    return res.json({ msg: 'Item created', item: rows[0] });
  } catch (err) {
    console.error('POST /supplier/items', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// PUT update item (supplier owns it)
router.put('/supplier/items/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') return res.status(403).json({ msg: 'Forbidden' });
    const supplierId = req.user.id;
    const itemId = req.params.id;
    const { title, price, stock, unit } = req.body;
    // ensure ownership
    const [rows] = await db.query('SELECT id FROM items WHERE id=? AND supplier_id=?', [itemId, supplierId]);
    if (!rows.length) return res.status(404).json({ msg: 'Item not found or not yours' });
    await db.query('UPDATE items SET title=?, price=?, stock=?, unit=? WHERE id=?', [title, price, stock, unit, itemId]);
    const [updated] = await db.query('SELECT id, title, price, stock, unit, created_at FROM items WHERE id=?', [itemId]);
    res.json({ item: updated[0] });
  } catch (err) {
    console.error('PUT /supplier/items/:id', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// DELETE item (only owner)
router.delete('/supplier/items/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') return res.status(403).json({ msg: 'Forbidden' });
    const supplierId = req.user.id;
    const itemId = req.params.id;

    // ensure the item belongs to this supplier
    const [rows] = await db.query(`SELECT id FROM items WHERE id = ? AND supplier_id = ?`, [itemId, supplierId]);
    if (!rows.length) return res.status(404).json({ msg: 'Item not found or not yours' });

    await db.query(`DELETE FROM items WHERE id = ?`, [itemId]);
    res.json({ msg: 'Item deleted' });
  } catch (err) {
    console.error('DELETE /supplier/items/:id', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
