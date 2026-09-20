const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.username,
              COALESCE(SUM(m.points), 0) AS points,
              COUNT(s.id) AS missionsCompleted
       FROM users u
       LEFT JOIN submissions s ON s.user_id = u.id
       LEFT JOIN missions m ON m.id = s.mission_id
       GROUP BY u.id
       ORDER BY points DESC, missionsCompleted DESC, u.username ASC`
    )
    .all();

  res.json(rows);
});

module.exports = router;
