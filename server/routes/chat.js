const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

/**
 * Community group chat API (every route needs a logged-in user).
 *
 *   GET    /api/chat/me                      my chat nickname (or null)
 *   POST   /api/chat/nickname                choose / change my nickname
 *   GET    /api/chat/rooms/:room/messages    the latest messages in a room
 *   POST   /api/chat/rooms/:room/messages    send a message
 *   DELETE /api/chat/messages/:id            delete MY message
 *   POST   /api/chat/messages/:id/report     report someone else's message
 *
 * PRIVACY RULES built into the server (the browser cannot skip them):
 *   - Only a chosen NICKNAME is ever shown. Real names and emails are never sent to other people.
 *   - Phone numbers, e-mail / UPI ids and web links in a message are replaced before saving.
 *   - Messages are deleted automatically after 7 days.
 *   - You can delete your own messages; 3 different reports hide a message automatically.
 *   - Rate limits stop flooding and spam.
 */
const router = express.Router();
router.use(requireAuth);

const ROOMS = ['general', 'buy-sell', 'beginners', 'india'];
const MAX_LEN = 300;
const KEEP_DAYS = 7;
const REPORTS_TO_HIDE = 3;
const LATEST = 50;
const MAX_INT = 2147483647;

const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id >= 1 && id <= MAX_INT ? id : null;
};

/** Replaces contact details with a placeholder. Returns { text, masked }. */
function maskPrivate(input) {
  let masked = false;
  const swap = (re, label) => {
    input = input.replace(re, () => {
      masked = true;
      return label;
    });
  };
  swap(/\b(?:https?:\/\/|www\.)\S+/gi, '[link removed]');
  swap(/[\w.+-]+@[\w-]+(?:\.[\w-]+)*/g, '[contact hidden]'); // e-mail and UPI ids such as name@bank
  // Phone numbers: any run of digits/separators that holds 10 or more digits.
  input = input.replace(/\+?\d[\d\s().-]{8,}\d/g, (m) => {
    if (m.replace(/\D/g, '').length >= 10) {
      masked = true;
      return '[number hidden]';
    }
    return m;
  });
  return { text: input, masked };
}

const NICK_RE = /^[A-Za-z0-9][A-Za-z0-9 _-]{2,19}$/;
const RESERVED = /admin|moderator|philaconnect|support|staff|official|owner/i;

function validNickname(raw) {
  const nick = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';
  if (!NICK_RE.test(nick)) return { error: 'Use 3 to 20 letters, numbers, spaces, - or _.' };
  if (RESERVED.test(nick)) return { error: 'That nickname is not allowed. Please choose another.' };
  return { nick };
}

let lastCleanup = 0;
/** Deletes old messages, at most once an hour (called while people are reading). */
async function cleanupOld() {
  if (Date.now() - lastCleanup < 60 * 60 * 1000) return;
  lastCleanup = Date.now();
  await pool.query(`DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '${KEEP_DAYS} days'`);
}

const sameUser = (a, b) => a !== undefined && a !== null && String(a) === String(b);

// GET /me
router.get('/me', async (req, res) => {
  try {
    const r = await pool.query('SELECT nickname FROM chat_profiles WHERE user_id = $1', [req.userId]);
    res.json({ nickname: r.rows[0] ? r.rows[0].nickname : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while loading your chat profile.' });
  }
});

// POST /nickname
router.post('/nickname', async (req, res) => {
  const { nick, error } = validNickname(req.body && req.body.nickname);
  if (error) return res.status(400).json({ message: error, errors: { nickname: error } });
  try {
    await pool.query(
      `INSERT INTO chat_profiles (user_id, nickname) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET nickname = EXCLUDED.nickname`,
      [req.userId, nick],
    );
    res.json({ nickname: nick });
  } catch (err) {
    if (err.code === '23505') {
      const msg = 'That nickname is already taken. Please choose another.';
      return res.status(409).json({ message: msg, errors: { nickname: msg } });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error while saving your nickname.' });
  }
});

// GET /rooms/:room/messages
router.get('/rooms/:room/messages', async (req, res) => {
  if (!ROOMS.includes(req.params.room)) return res.status(404).json({ message: 'Chat room not found.' });
  try {
    cleanupOld().catch((e) => console.error(e));
    const r = await pool.query(
      `SELECT m.id, m.body, m.created_at, m.user_id, p.nickname
         FROM chat_messages m LEFT JOIN chat_profiles p ON p.user_id = m.user_id
        WHERE m.room = $1 AND m.hidden = FALSE
        ORDER BY m.id DESC LIMIT ${LATEST}`,
      [req.params.room],
    );
    res.json({
      messages: r.rows.reverse().map((m) => ({
        id: m.id,
        nickname: m.nickname || 'Collector',
        body: m.body,
        createdAt: m.created_at,
        mine: sameUser(req.userId, m.user_id),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while loading the chat.' });
  }
});

// POST /rooms/:room/messages
router.post('/rooms/:room/messages', async (req, res) => {
  const room = req.params.room;
  if (!ROOMS.includes(room)) return res.status(404).json({ message: 'Chat room not found.' });
  const raw = typeof (req.body && req.body.body) === 'string' ? req.body.body.replace(/\s+/g, ' ').trim() : '';
  if (raw.length < 1) return res.status(400).json({ message: 'Please type a message.' });
  if (raw.length > MAX_LEN) return res.status(400).json({ message: `Messages can be at most ${MAX_LEN} characters.` });

  try {
    const profile = await pool.query('SELECT nickname FROM chat_profiles WHERE user_id = $1', [req.userId]);
    if (profile.rows.length === 0) {
      return res.status(403).json({ message: 'Please choose a chat nickname first.', code: 'NO_NICKNAME' });
    }

    const burst = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '10 seconds')::int AS ten,
              COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute')::int  AS minute
         FROM chat_messages WHERE user_id = $1`,
      [req.userId],
    );
    if (burst.rows[0].ten >= 4 || burst.rows[0].minute >= 20) {
      return res.status(429).json({ message: 'You are sending messages too fast. Please wait a moment.' });
    }

    const { text, masked } = maskPrivate(raw);
    const dup = await pool.query(
      `SELECT 1 FROM chat_messages WHERE user_id = $1 AND room = $2 AND body = $3 AND created_at > NOW() - INTERVAL '30 seconds'`,
      [req.userId, room, text],
    );
    if (dup.rows.length > 0) return res.status(400).json({ message: 'You already sent that message.' });

    const r = await pool.query(
      'INSERT INTO chat_messages (room, user_id, body) VALUES ($1,$2,$3) RETURNING id',
      [room, req.userId, text],
    );
    res.status(201).json({
      id: r.rows[0].id,
      masked,
      notice: masked ? 'For your safety, phone numbers, e-mail / UPI ids and links are hidden in chat.' : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while sending your message.' });
  }
});

// DELETE /messages/:id (own messages only)
router.delete('/messages/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Message not found.' });
  try {
    const r = await pool.query('DELETE FROM chat_messages WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (r.rowCount === 0) return res.status(404).json({ message: 'Message not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting.' });
  }
});

// POST /messages/:id/report
router.post('/messages/:id/report', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Message not found.' });
  try {
    const msg = await pool.query('SELECT user_id FROM chat_messages WHERE id = $1', [id]);
    if (msg.rows.length === 0) return res.status(404).json({ message: 'Message not found.' });
    if (sameUser(req.userId, msg.rows[0].user_id)) {
      return res.status(400).json({ message: 'You cannot report your own message.' });
    }
    await pool.query(
      'INSERT INTO chat_reports (message_id, reporter_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [id, req.userId],
    );
    const count = await pool.query('SELECT COUNT(*)::int AS n FROM chat_reports WHERE message_id = $1', [id]);
    const hidden = count.rows[0].n >= REPORTS_TO_HIDE;
    if (hidden) await pool.query('UPDATE chat_messages SET hidden = TRUE WHERE id = $1', [id]);
    res.json({ ok: true, hidden });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while reporting.' });
  }
});

router.ROOMS = ROOMS;
module.exports = router;
