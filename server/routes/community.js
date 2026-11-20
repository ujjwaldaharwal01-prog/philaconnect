const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

/**
 * Community discussion board API.
 *
 *   GET    /api/community/posts?topic=&q=&page=   list posts (public)
 *   GET    /api/community/posts/:id               one post with its comments (public)
 *   POST   /api/community/posts                   create a post          (login required)
 *   DELETE /api/community/posts/:id               delete MY post         (login required)
 *   POST   /api/community/posts/:id/comments      comment on a post      (login required)
 *   DELETE /api/community/comments/:id            delete MY comment      (login required)
 *
 * Reading is public so visitors can see the community before signing up. Writing needs a login.
 * Only the author's NAME is shown, never an email address.
 */
const router = express.Router();

const TOPICS = ['General', 'Identification', 'Buy & Sell', 'Collecting Tips', 'Show & Tell'];
const PAGE_SIZE = 10;
const MAX_INT = 2147483647;
const HOURLY_POST_LIMIT = 10; // simple spam protection
const HOURLY_COMMENT_LIMIT = 30;

/** Reads the login token if there is one (never fails). Sets req.userId, or leaves it undefined. */
function optionalAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
      /* invalid or expired token: treat as a visitor */
    }
  }
  next();
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const sameUser = (a, b) => a !== undefined && a !== null && String(a) === String(b);
const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id >= 1 && id <= MAX_INT ? id : null;
};

function formatPost(row, userId) {
  return {
    id: row.id,
    topic: row.topic,
    title: row.title,
    body: row.body,
    author: row.author_name || 'Collector',
    createdAt: row.created_at,
    commentCount: Number(row.comment_count || 0),
    mine: sameUser(userId, row.user_id),
  };
}
function formatComment(row, userId) {
  return {
    id: row.id,
    body: row.body,
    author: row.author_name || 'Collector',
    createdAt: row.created_at,
    mine: sameUser(userId, row.user_id),
  };
}

// GET /posts
router.get('/posts', optionalAuth, async (req, res) => {
  const topic = TOPICS.includes(req.query.topic) ? req.query.topic : null;
  const q = clean(req.query.q, 80);
  const page = Math.max(1, Math.min(1000, parseInt(req.query.page, 10) || 1));
  // ILIKE with escaped % and _ so the search text is treated literally.
  const like = q ? `%${q.replace(/[\\%_]/g, '\\$&')}%` : null;
  const where = 'WHERE ($1::text IS NULL OR p.topic = $1) AND ($2::text IS NULL OR p.title ILIKE $2 OR p.body ILIKE $2)';
  try {
    const total = await pool.query(`SELECT COUNT(*)::int AS n FROM community_posts p ${where}`, [topic, like]);
    const rows = await pool.query(
      `SELECT p.*, u.name AS author_name,
              (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comment_count
         FROM community_posts p LEFT JOIN users u ON u.id = p.user_id
         ${where}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT ${PAGE_SIZE} OFFSET $3`,
      [topic, like, (page - 1) * PAGE_SIZE],
    );
    res.json({
      posts: rows.rows.map((r) => formatPost(r, req.userId)),
      total: total.rows[0].n,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while loading discussions.' });
  }
});

// GET /posts/:id
router.get('/posts/:id', optionalAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Discussion not found.' });
  try {
    const post = await pool.query(
      `SELECT p.*, u.name AS author_name,
              (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comment_count
         FROM community_posts p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
      [id],
    );
    if (post.rows.length === 0) return res.status(404).json({ message: 'Discussion not found.' });
    const comments = await pool.query(
      `SELECT c.*, u.name AS author_name FROM community_comments c
         LEFT JOIN users u ON u.id = c.user_id WHERE c.post_id = $1 ORDER BY c.created_at, c.id`,
      [id],
    );
    res.json({
      post: formatPost(post.rows[0], req.userId),
      comments: comments.rows.map((c) => formatComment(c, req.userId)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while loading the discussion.' });
  }
});

// POST /posts
router.post('/posts', requireAuth, async (req, res) => {
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const topic = typeof b.topic === 'string' ? b.topic : '';
  const title = clean(b.title, 120);
  const body = clean(b.body, 2000);
  const errors = {};
  if (!TOPICS.includes(topic)) errors.topic = 'Please choose a topic.';
  if (title.length < 5) errors.title = 'Title must be at least 5 characters.';
  if (body.length < 10) errors.body = 'Please write at least 10 characters.';
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  }
  try {
    const recent = await pool.query(
      `SELECT COUNT(*)::int AS n FROM community_posts WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [req.userId],
    );
    if (recent.rows[0].n >= HOURLY_POST_LIMIT) {
      return res.status(429).json({ message: 'You are posting very fast. Please try again in a while.' });
    }
    const r = await pool.query(
      'INSERT INTO community_posts (user_id, topic, title, body) VALUES ($1,$2,$3,$4) RETURNING id',
      [req.userId, topic, title, body],
    );
    res.status(201).json({ id: r.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while saving your post.' });
  }
});

// DELETE /posts/:id (own posts only; comments go with it)
router.delete('/posts/:id', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Discussion not found.' });
  try {
    const r = await pool.query('DELETE FROM community_posts WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (r.rowCount === 0) return res.status(404).json({ message: 'Discussion not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting.' });
  }
});

// POST /posts/:id/comments
router.post('/posts/:id/comments', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Discussion not found.' });
  const body = clean(req.body && req.body.body, 1000);
  if (body.length < 2) {
    return res.status(400).json({ message: 'Please fix the highlighted fields.', errors: { body: 'Please write a comment.' } });
  }
  try {
    const exists = await pool.query('SELECT 1 FROM community_posts WHERE id = $1', [id]);
    if (exists.rows.length === 0) return res.status(404).json({ message: 'Discussion not found.' });
    const recent = await pool.query(
      `SELECT COUNT(*)::int AS n FROM community_comments WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [req.userId],
    );
    if (recent.rows[0].n >= HOURLY_COMMENT_LIMIT) {
      return res.status(429).json({ message: 'You are commenting very fast. Please try again in a while.' });
    }
    const r = await pool.query(
      'INSERT INTO community_comments (post_id, user_id, body) VALUES ($1,$2,$3) RETURNING id',
      [id, req.userId, body],
    );
    res.status(201).json({ id: r.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while saving your comment.' });
  }
});

// DELETE /comments/:id (own comments only)
router.delete('/comments/:id', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Comment not found.' });
  try {
    const r = await pool.query('DELETE FROM community_comments WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (r.rowCount === 0) return res.status(404).json({ message: 'Comment not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting.' });
  }
});

router.TOPICS = TOPICS;
module.exports = router;
