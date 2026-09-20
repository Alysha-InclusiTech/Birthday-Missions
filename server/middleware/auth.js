const { parseCookies, verifyToken, COOKIE_NAME } = require('../lib/auth');

function requireAuth(req, res, next) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  const payload = token && verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  req.user = payload; // { id, username }
  next();
}

module.exports = { requireAuth };
