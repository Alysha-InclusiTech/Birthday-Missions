const path = require('path');

// DATA_DIR points at a directory that must survive restarts/redeploys.
// On a host with a persistent volume (Railway, Render, Fly.io), set
// DATA_DIR to that volume's mount path so the database and uploaded
// proofs aren't wiped on every deploy.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'data.sqlite');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, 'uploads');

module.exports = { DATA_DIR, DB_PATH, UPLOAD_DIR };
