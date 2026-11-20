const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');
const stampCatalog = require('../data/stampCatalog');

const router = express.Router();

// Simulated delivery progress: status auto-advances based on time since order was placed.
// No real courier needed — this gives a realistic-looking tracking timeline for the demo.
function computeAutoStatus(createdAt, storedStatus) {
  if (storedStatus === 'cancelled') return storedStatus;
  const elapsedSeconds = (Date.now() - new Date(createdAt).getTime()) / 1000;
  if (elapsedSeconds >= 180) return 'delivered';
  if (elapsedSeconds >= 120) return 'shipped';
  if (elapsedSeconds >= 60) return 'confirmed';
  return 'placed';
}

async function buildOrderResponse(orderRow) {
  const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderRow.id]);
  const liveStatus = computeAutoStatus(orderRow.created_at, orderRow.status);

  return {
    id: orderRow.id,
    status: liveStatus,
    paymentMethod: orderRow.payment_method,
    paymentMethodLabel: orderRow.payment_method === 'cod' ? 'Cash on Delivery' : 'Pay later',
    paymentStatus: orderRow.payment_status,
    subtotal: Number(orderRow.subtotal),
    createdAt: orderRow.created_at,
    notes: orderRow.notes,
    shipping: {
      fullName: orderRow.shipping_name,
      phone: orderRow.phone,
      addressLine1: orderRow.address_line1,
      addressLine2: orderRow.address_line2,
      city: orderRow.city,
      state: orderRow.state,
      postalCode: orderRow.postal_code,
      country: orderRow.country,
    },
    items: itemsResult.rows.map((i) => ({
      stampId: i.stamp_id,
      name: i.name,
      country: i.country,
      year: i.year,
      condition: i.condition,
      unitPrice: Number(i.unit_price),
      quantity: i.quantity,
      lineTotal: Number(i.unit_price) * i.quantity,
    })),
  };
}

// POST /api/orders — place an order
router.post('/', requireAuth, async (req, res) => {
  const {
    fullName, phone, addressLine1, addressLine2, city, state, postalCode, country,
    paymentMethod, notes, items, creditsToRedeem, spinVoucherPercent, quizVoucherPercent,
  } = req.body;

  if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !paymentMethod || !items || !items.length) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    let subtotal = 0;
    const lineItems = [];
    for (const { id, qty } of items) {
      const stamp = stampCatalog.find((s) => s.id === id);
      if (!stamp) return res.status(400).json({ message: `Stamp ${id} not found.` });
      subtotal += stamp.price * qty;
      lineItems.push({ stamp, qty });
    }

    // Redeem Collector Credits for a discount. Rate: 10 credits = ₹1 off.
    const userResult = await pool.query('SELECT credits FROM users WHERE id = $1', [req.userId]);
    const availableCredits = userResult.rows[0]?.credits || 0;
    const requestedCredits = Math.max(0, Math.min(Number(creditsToRedeem) || 0, availableCredits));
    const creditDiscount = requestedCredits / 10;

    // Daily spin-wheel voucher (5% / 10% / 15%) and daily quiz voucher (5% / 10% / 15%).
    const spinDiscount = subtotal * (Math.max(0, Math.min(15, Number(spinVoucherPercent) || 0)) / 100);
    const quizDiscount = subtotal * (Math.max(0, Math.min(15, Number(quizVoucherPercent) || 0)) / 100);

    // Overall cap: all discounts combined never exceed 15% of the order, so margins stay healthy.
    const totalDiscountCap = subtotal * 0.15;
    const rawTotalDiscount = creditDiscount + spinDiscount + quizDiscount;
    const totalDiscount = Math.min(rawTotalDiscount, totalDiscountCap);
    // Scale down credits used proportionally if the cap trimmed the total discount.
    const scaleFactor = rawTotalDiscount > 0 ? totalDiscount / rawTotalDiscount : 0;
    const creditsActuallyUsed = Math.round(requestedCredits * scaleFactor);

    const finalSubtotal = Math.max(0, subtotal - totalDiscount);

    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, payment_method, subtotal, shipping_name, phone, address_line1, address_line2, city, state, postal_code, country, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id, created_at`,
      [req.userId, paymentMethod, finalSubtotal, fullName, phone, addressLine1, addressLine2 || '', city, state, postalCode, country || 'India', notes || '']
    );
    const orderId = orderResult.rows[0].id;

    for (const { stamp, qty } of lineItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, stamp_id, name, country, year, condition, unit_price, quantity)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [orderId, stamp.id, stamp.name, stamp.country, stamp.year, stamp.condition, stamp.price, qty]
      );
    }

    if (creditsActuallyUsed > 0) {
      await pool.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [creditsActuallyUsed, req.userId]);
    }
    if (spinVoucherPercent > 0) {
      await pool.query('UPDATE users SET spin_discount_used = true WHERE id = $1', [req.userId]);
    }
    if (quizVoucherPercent > 0) {
      await pool.query('UPDATE users SET quiz_discount_used = true WHERE id = $1', [req.userId]);
    }

    res.status(201).json({ order: { id: orderId }, discountApplied: totalDiscount, creditsUsed: creditsActuallyUsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not place your order.' });
  }
});

// GET /api/orders — logged-in user's order history
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    const orders = await Promise.all(result.rows.map(buildOrderResponse));
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your orders.' });
  }
});

// GET /api/orders/:id — one order, only if it belongs to the logged-in user
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const order = await buildOrderResponse(result.rows[0]);
    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load this order.' });
  }
});

module.exports = router;