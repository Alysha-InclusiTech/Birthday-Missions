const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const ALLOWED_MIME = /^(image|video)\//;
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.test(file.mimetype)) {
      return cb(new Error('Only image or video files are allowed.'));
    }
    cb(null, true);
  },
});

router.use(requireAuth);

router.get('/', (req, res) => {
  const missions = db.prepare('SELECT * FROM missions ORDER BY number').all();
  const submissions = db
    .prepare('SELECT * FROM submissions WHERE user_id = ?')
    .all(req.session.userId);
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
      proof: sub
        ? { filePath: `/uploads/${path.basename(sub.file_path)}`, mediaType: sub.media_type, submittedAt: sub.submitted_at }
        : null,
    };
  });

  res.json(payload);
});

router.post('/:id/submit', (req, res, next) => {
  upload.single('proof')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  const missionId = Number(req.params.id);
  const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(missionId);
  if (!mission) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: 'Mission not found.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'A photo or video proof file is required.' });
  }

  const existing = db
    .prepare('SELECT id FROM submissions WHERE user_id = ? AND mission_id = ?')
    .get(req.session.userId, missionId);
  if (existing) {
    fs.unlink(req.file.path, () => {});
    return res.status(409).json({ error: 'You already completed this mission.' });
  }

  const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  db.prepare(
    'INSERT INTO submissions (user_id, mission_id, file_path, media_type) VALUES (?, ?, ?, ?)'
  ).run(req.session.userId, missionId, req.file.filename, mediaType);

  res.json({
    ok: true,
    proof: { filePath: `/uploads/${req.file.filename}`, mediaType, submittedAt: new Date().toISOString() },
    pointsAwarded: mission.points,
  });
});

module.exports = router;
