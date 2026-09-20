const express = require('express');
const bcrypt = require('bcryptjs');
const { sql, ensureInitialized } = require('../db');
const { signToken, setAuthCookie, clearAuthCookie, parseCookies, verifyToken, COOKIE_NAME } = require('../lib/auth');

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_ ]{2,30}$/;

router.post('/register', async (req, res) => {
  await ensureInitialized();
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || !USERNAME_RE.test(username.trim())) {
    return res.status(400).json({ error: 'Username must be 2-30 characters (letters, numbers, spaces, underscores).' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const cleanUsername = username.trim();
  const passwordHash = await bcrypt.hash(password, 10);

  let user;
  try {
    const rows = await sql`
      INSERT INTO users (username, password_hash) VALUES (${cleanUsername}, ${passwordHash})
      RETURNING id, username
    `;
    user = rows[0];
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username is already taken.' });
    }
    throw err;
  }

  setAuthCookie(res, signToken(user));
  res.json(user);
});

router.post('/login', async (req, res) => {
  await ensureInitialized();
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const rows = await sql`SELECT * FROM users WHERE username = ${username.trim()}`;
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  setAuthCookie(res, signToken(user));
  res.json({ id: user.id, username: user.username });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const cookies = parseCookies(req);
  const payload = cookies[COOKIE_NAME] && verifyToken(cookies[COOKIE_NAME]);
  if (!payload) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({ id: payload.id, username: payload.username });
});

module.exports = router;
