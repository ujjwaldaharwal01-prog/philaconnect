const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const pool = require('./db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const communityRoutes = require('./routes/community');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');

const app = express();
app.set('trust proxy', 1);
// Secure HTTP headers (prevents clickjacking, MIME sniffing, and other common attacks).
app.use(helmet());

// Only allow requests from our own frontend, not from any random website.
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));

// Limit repeated requests to stop brute-force attacks and basic abuse.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  message: { message: 'Too many requests. Please try again later.' },
});
app.use(generalLimiter);

// Stricter limit specifically on login/register, to stop password-guessing attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/register attempts per 15 minutes per IP
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth', authLimiter);
app.use('/api/chat', chatRoutes);
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/game', gameRoutes);

// Unknown /api URLs get a clear JSON 404 instead of an HTML page.
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Safety net: any error that slips through returns JSON, not a stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
