// routes/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ msg: 'Missing Authorization header' });

    // expected: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ msg: 'Invalid Authorization format' });
    }
    const token = parts[1];

    const payload = jwt.verify(token, JWT_SECRET);
    // attach user payload (id, role, name, email) to request
    req.user = payload;
    return next();
  } catch (err) {
    console.error('authMiddleware:', err && err.message ? err.message : err);
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};
