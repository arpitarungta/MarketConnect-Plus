// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const orderRoutes = require("./routes/orders"); // 👈 move UP
const userRoutes = require("./routes/user");

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);
app.use('/api', protectedRoutes);
app.use("/api/orders", orderRoutes); // 👈 BEFORE listen
app.use("/api/items", require("./routes/items"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/recommendations", require("./routes/recommendation"));
// health
app.get('/', (req, res) =>
  res.json({ ok: true, msg: 'MarketConnect+ backend running' })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
