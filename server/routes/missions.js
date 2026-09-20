const express = require('express');
const { handleUpload } = require('@vercel/blob/client');
const { sql, ensureInitialized } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB

router.use(requireAuth);

router.get('/', async (req, res) => {
  await ensureInitialized();

  const missions = await sql`SELECT * FROM missions ORDER BY number`;
  const submissions = await sql`SELECT * FROM submissions WHERE user_id = ${req.user.id}`;
  const submissionByMission = new Map(submissions.map((s) => [s.mission_id, s]));

  const payload = missions.map((m) => {
    const sub = submissionByMission.get(m.id);
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      tag: m.tag,
      points: m.points,
      completed: Boolean(sub),
      proof: sub ? { filePath: sub.file_url, mediaType: sub.media_type, submittedAt: sub.submitted_at } : null,
    };
  });

  res.json(payload);
});

// Issues a short-lived, scoped token so the browser can upload the proof
// file directly to Vercel Blob storage, bypassing this server (and its
// request-size limits) entirely for large photo/video files.
router.post('/upload-token', async (req, res) => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/*', 'video/*'],
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        addRandomSuffix: true,
      }),
    });
    res.json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/submit', async (req, res) => {
  await ensureInitialized();

  const missionId = Number(req.params.id);
  const { blobUrl, mediaType } = req.body || {};

  if (typeof blobUrl !== 'string' || !blobUrl.startsWith('https://')) {
    return res.status(400).json({ error: 'A valid uploaded proof URL is required.' });
  }
  if (mediaType !== 'image' && mediaType !== 'video') {
    return res.status(400).json({ error: 'mediaType must be "image" or "video".' });
  }

  const missionRows = await sql`SELECT * FROM missions WHERE id = ${missionId}`;
  const mission = missionRows[0];
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found.' });
  }

  const existingRows = await sql`
    SELECT id FROM submissions WHERE user_id = ${req.user.id} AND mission_id = ${missionId}
  `;
  if (existingRows[0]) {
    return res.status(409).json({ error: 'You already completed this mission.' });
  }

  let submittedAt;
  try {
    const inserted = await sql`
      INSERT INTO submissions (user_id, mission_id, file_url, media_type)
      VALUES (${req.user.id}, ${missionId}, ${blobUrl}, ${mediaType})
      RETURNING submitted_at
    `;
    submittedAt = inserted[0].submitted_at;
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already completed this mission.' });
    }
    throw err;
  }

  res.json({
    ok: true,
    proof: { filePath: blobUrl, mediaType, submittedAt },
    pointsAwarded: mission.points,
  });
});

module.exports = router;
