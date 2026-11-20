const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Credits earned per game are capped server-side so the browser score can never be abused.
const MAX_CREDITS_PER_SESSION = 150;

router.get('/credits', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT credits FROM users WHERE id = $1', [req.userId]);
    res.json({ credits: result.rows[0]?.credits || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your credits.' });
  }
});

router.post('/credits', requireAuth, async (req, res) => {
  const earned = Math.max(0, Math.min(Number(req.body.earned) || 0, MAX_CREDITS_PER_SESSION));
  try {
    const result = await pool.query(
      'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits',
      [earned, req.userId]
    );
    res.json({ credits: result.rows[0].credits, earned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not save your credits.' });
  }
});
// Wheel has 8 equal segments; outcomes repeat to control odds (4 miss, 2×5%, 1×10%, 1×15%).
const WHEEL_SEGMENTS = [
  { percent: 5, label: '5% OFF' },
  { percent: 0, label: 'Better luck next time' },
  { percent: 10, label: '10% OFF' },
  { percent: 0, label: 'Better luck next time' },
  { percent: 5, label: '5% OFF' },
  { percent: 0, label: 'Better luck next time' },
  { percent: 15, label: '15% OFF' },
  { percent: 0, label: 'Better luck next time' },
];
const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

router.get('/spin-status', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT last_spin_at, spin_discount_percent, spin_discount_used FROM users WHERE id = $1',
      [req.userId]
    );
    const row = result.rows[0];
    const nextAvailableAt = row.last_spin_at
      ? new Date(new Date(row.last_spin_at).getTime() + SPIN_COOLDOWN_MS)
      : null;
    const canSpin = !nextAvailableAt || Date.now() >= nextAvailableAt.getTime();
    res.json({
      canSpin,
      nextAvailableAt,
      activeVoucherPercent: row.spin_discount_used ? 0 : row.spin_discount_percent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load spin status.' });
  }
});

router.post('/spin', requireAuth, async (req, res) => {
  try {
    const statusResult = await pool.query('SELECT last_spin_at FROM users WHERE id = $1', [req.userId]);
    const lastSpinAt = statusResult.rows[0]?.last_spin_at;
    if (lastSpinAt && Date.now() - new Date(lastSpinAt).getTime() < SPIN_COOLDOWN_MS) {
      return res.status(429).json({ message: 'You can only spin once every 24 hours.' });
    }

    const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segment = WHEEL_SEGMENTS[segmentIndex];

    await pool.query(
      `UPDATE users SET last_spin_at = NOW(), spin_discount_percent = $1, spin_discount_used = $2 WHERE id = $3`,
      [segment.percent, segment.percent === 0, req.userId]
    );

    res.json({ segmentIndex, label: segment.label, discountPercent: segment.percent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not spin the wheel.' });
  }
});
// Answers are kept server-side only, so the browser never sees the correct option.
const QUIZ_QUESTIONS = [
  {
    question: 'What is a philatelist?',
    options: ['A stamp collector', 'A coin collector', 'A rare book seller', 'A postal worker'],
    correctIndex: 0,
  },
  {
    question: 'Which country issued the famous "Penny Black", the world\u2019s first adhesive postage stamp?',
    options: ['France', 'United Kingdom', 'United States', 'Germany'],
    correctIndex: 1,
  },
  {
    question: 'What does "MNH" mean on a stamp listing?',
    options: ['Mint Never Hinged', 'Made New Here', 'Mostly Not Handled', 'Mint No History'],
    correctIndex: 0,
  },
  {
    question: 'A stamp with a printing error that makes it rarer is called what?',
    options: ['A reprint', 'An error stamp', 'A duplicate', 'A specimen'],
    correctIndex: 1,
  },
  {
    question: 'What tool do collectors use to measure the perforations (tiny holes) on a stamp?',
    options: ['A perforation gauge', 'A magnifying glass only', 'A ruler', 'A stamp hinge'],
    correctIndex: 0,
  },
];

const QUIZ_COOLDOWN_MS = 24 * 60 * 60 * 1000;

router.get('/quiz', requireAuth, async (req, res) => {
  // Send questions WITHOUT the correct answer.
  const safeQuestions = QUIZ_QUESTIONS.map((q) => ({ question: q.question, options: q.options }));
  const statusResult = await pool.query('SELECT last_quiz_at, quiz_discount_percent, quiz_discount_used FROM users WHERE id = $1', [req.userId]);
  const row = statusResult.rows[0];
  const nextAvailableAt = row.last_quiz_at ? new Date(new Date(row.last_quiz_at).getTime() + QUIZ_COOLDOWN_MS) : null;
  const canPlay = !nextAvailableAt || Date.now() >= nextAvailableAt.getTime();
  res.json({
    questions: safeQuestions,
    canPlay,
    nextAvailableAt,
    activeVoucherPercent: row.quiz_discount_used ? 0 : row.quiz_discount_percent,
  });
});

router.post('/quiz', requireAuth, async (req, res) => {
  const { answers } = req.body; // array of selected option indexes, same length as QUIZ_QUESTIONS

  try {
    const lastResult = await pool.query('SELECT last_quiz_at FROM users WHERE id = $1', [req.userId]);
    const lastQuizAt = lastResult.rows[0]?.last_quiz_at;
    if (lastQuizAt && Date.now() - new Date(lastQuizAt).getTime() < QUIZ_COOLDOWN_MS) {
      return res.status(429).json({ message: 'You can only play the quiz once every 24 hours.' });
    }

    if (!Array.isArray(answers) || answers.length !== QUIZ_QUESTIONS.length) {
      return res.status(400).json({ message: 'Invalid answers submitted.' });
    }

    let correctCount = 0;
    const results = QUIZ_QUESTIONS.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correctCount += 1;
      return { correctIndex: q.correctIndex, isCorrect };
    });

    let discountPercent = 0;
    if (correctCount === 5) discountPercent = 15;
    else if (correctCount === 4) discountPercent = 10;
    else if (correctCount === 3) discountPercent = 5;

    await pool.query(
      'UPDATE users SET last_quiz_at = NOW(), quiz_discount_percent = $1, quiz_discount_used = $2 WHERE id = $3',
      [discountPercent, discountPercent === 0, req.userId]
    );

    res.json({ correctCount, total: QUIZ_QUESTIONS.length, discountPercent, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not submit your quiz.' });
  }
});
module.exports = router;