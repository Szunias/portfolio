/* Local preview with native audio/video seeking. Not included in the deploy. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.m4a': 'audio/mp4', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

function byteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || !size) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return null;
  return { start, end };
}

function isInside(root, file) {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}

function checkedRealPath(root, file) {
  const resolved = fs.realpathSync(file);
  if (!isInside(root, resolved)) {
    const error = new Error('Path leaves the preview root');
    error.code = 'ERR_PREVIEW_OUTSIDE_ROOT';
    throw error;
  }
  return resolved;
}

function createPreviewServer(directory) {
  const root = fs.realpathSync(path.resolve(directory));
  return http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(req.url.split('?')[0]);
      if (pathname.includes('\0')) throw new Error('NUL in path');
    } catch {
      res.writeHead(400).end('Bad request');
      return;
    }
    let file = path.resolve(root, '.' + pathname.replace(/\\/g, '/'));
    if (!isInside(root, file)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    try {
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
      // Lexical traversal checks do not catch symlinked files or directories.
      // Resolve both the requested file and the 404 fallback before reading.
      const resolved = fs.existsSync(file) ? checkedRealPath(root, file) : null;
      if (!resolved || !fs.statSync(resolved).isFile()) {
        const fallback = path.join(root, '404.html');
        const resolvedFallback = fs.existsSync(fallback) ? checkedRealPath(root, fallback) : null;
        const body = resolvedFallback && fs.statSync(resolvedFallback).isFile()
          ? fs.readFileSync(resolvedFallback) : Buffer.from('Not found');
        res.writeHead(404, { 'Content-Type': TYPES['.html'], 'Content-Length': body.length });
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
      }
      const size = fs.statSync(resolved).size;
      const headers = {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Content-Length': size, 'Accept-Ranges': 'bytes',
      };
      // Range is defined for GET; HEAD reports the full representation.
      const range = req.method === 'GET' && req.headers.range;
      let bounds;
      if (range) {
        bounds = byteRange(range, size);
        if (!bounds) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
        headers['Content-Range'] = `bytes ${bounds.start}-${bounds.end}/${size}`;
        headers['Content-Length'] = bounds.end - bounds.start + 1;
      }
      res.writeHead(bounds ? 206 : 200, headers);
      if (req.method === 'HEAD') { res.end(); return; }
      const stream = fs.createReadStream(resolved, bounds);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (res.headersSent) { res.destroy(); return; }
      const forbidden = error.code === 'ERR_PREVIEW_OUTSIDE_ROOT';
      res.writeHead(forbidden ? 403 : 500).end(forbidden ? 'Forbidden' : 'Could not read the preview file');
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  const root = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error('Run npm run build before starting the preview');
  createPreviewServer(root).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
}

module.exports = { createPreviewServer };
