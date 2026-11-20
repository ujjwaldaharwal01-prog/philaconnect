const jwt = require('jsonwebtoken');

/**
 * requireAuth: protects a route so only logged-in users can use it.
 *
 * The website sends the login token in a header:   Authorization: Bearer <token>
 * This middleware checks the token (signed by routes/auth.js with JWT_SECRET) and, if valid,
 * stores the user's id in req.userId so the route knows WHO is asking.
 * If the token is missing, wrong or expired it answers 401 and the route never runs.
 */
module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
};
