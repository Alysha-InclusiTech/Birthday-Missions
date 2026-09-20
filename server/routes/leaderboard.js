const express = require('express');
const { sql, ensureInitialized } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  await ensureInitialized();

  const rows = await sql`
    SELECT u.id, u.username,
           COALESCE(SUM(m.points), 0)::int AS points,
           COUNT(s.id)::int AS "missionsCompleted"
    FROM users u
    LEFT JOIN submissions s ON s.user_id = u.id
    LEFT JOIN missions m ON m.id = s.mission_id
    GROUP BY u.id
    ORDER BY points DESC, "missionsCompleted" DESC, u.username ASC
  `;

  res.json(rows);
});

module.exports = router;
