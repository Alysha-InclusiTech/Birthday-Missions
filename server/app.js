const path = require('path');
const express = require('express');

const authRoutes = require('./routes/auth');
const missionRoutes = require('./routes/missions');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Local dev only: on Vercel, files under public/ are served directly by the
// platform's static hosting and never reach this Express app.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Catches errors from any /api/* route (including rejected async handlers,
// which Express 5 forwards here automatically) so failures come back as
// JSON the frontend can parse, instead of an HTML stack-trace page.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

module.exports = app;
