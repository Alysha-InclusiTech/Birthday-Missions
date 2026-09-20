// Bundles @vercel/blob's browser upload client into a plain <script> global
// so the vanilla-JS frontend can call it without a bundler of its own.
const path = require('path');
const esbuild = require('esbuild');

esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'client', 'blob-entry.mjs')],
  bundle: true,
  format: 'iife',
  globalName: 'VercelBlobClient',
  platform: 'browser',
  target: 'es2020',
  outfile: path.join(__dirname, 'public', 'vendor', 'blob-client.js'),
});

console.log('Built public/vendor/blob-client.js');
