const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/me  (login required)
 * Returns the logged-in user's profile: { user: { id, name, email } }.
 * The password hash is never selected, so it can never leak.
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while loading your profile.' });
  }
});

module.exports = router;
