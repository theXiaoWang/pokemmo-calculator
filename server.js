const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

function normalizePort(value, fallback) {
	const parsed = Number.parseInt(String(value ?? ''), 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const defaultPort = 5000;
const requestedPort = process.env.PORT;
const basePort = normalizePort(requestedPort, defaultPort);
const maxPortAttempts = 20;

const distDir = path.join(__dirname, 'dist');

function contentTypeFor(filePath) {
	switch (path.extname(filePath).toLowerCase()) {
		case '.html':
			return 'text/html; charset=utf-8';
		case '.js':
			return 'text/javascript; charset=utf-8';
		case '.css':
			return 'text/css; charset=utf-8';
		case '.json':
			return 'application/json; charset=utf-8';
		case '.png':
			return 'image/png';
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.svg':
			return 'image/svg+xml';
		case '.gif':
			return 'image/gif';
		case '.ico':
			return 'image/x-icon';
		case '.woff':
			return 'font/woff';
		case '.woff2':
			return 'font/woff2';
		default:
			return 'application/octet-stream';
	}
}

function safeJoin(base, requestPath) {
	// Prevent path traversal; normalize and ensure inside base.
	const decoded = decodeURIComponent(requestPath);
	const normalized = path.normalize(decoded).replace(/^([\\/])+/g, '');
	const resolved = path.resolve(base, normalized);
	if (!resolved.startsWith(path.resolve(base) + path.sep) && resolved !== path.resolve(base)) {
		return null;
	}
	return resolved;
}

function sendFile(res, filePath) {
	fs.stat(filePath, (err, stats) => {
		if (err || !stats.isFile()) {
			res.statusCode = 404;
			res.setHeader('Content-Type', 'text/plain; charset=utf-8');
			res.end('Not found');
			return;
		}
		res.statusCode = 200;
		res.setHeader('Content-Type', contentTypeFor(filePath));
		res.setHeader('Cache-Control', 'no-cache');
		fs.createReadStream(filePath).pipe(res);
	});
}

function handler(req, res) {
	const parsed = url.parse(req.url || '/');
	const pathname = parsed.pathname || '/';

	if (pathname === '/') {
		res.statusCode = 302;
		res.setHeader('Location', '/dist/');
		res.end();
		return;
	}

	if (pathname === '/dist') {
		res.statusCode = 302;
		res.setHeader('Location', '/dist/');
		res.end();
		return;
	}

	// Serve everything from dist. Prefer /dist/* but also allow direct /css/* etc.
	let rel = pathname;
	if (rel.startsWith('/dist/')) rel = rel.slice('/dist/'.length);
	if (rel === '' || rel.endsWith('/')) rel = path.posix.join(rel, 'index.html');

	const filePath = safeJoin(distDir, rel);
	if (!filePath) {
		res.statusCode = 400;
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.end('Bad request');
		return;
	}
	sendFile(res, filePath);
}

function startServer(port, attempt = 0) {
	const server = http.createServer(handler);

	server.on('error', (err) => {
		if (err && err.code === 'EADDRINUSE') {
			if (requestedPort) {
				console.error(`Port ${port} is already in use. Set PORT to another value and retry.`);
				process.exit(1);
			}
			if (attempt + 1 >= maxPortAttempts) {
				console.error(
					`Could not find a free port in range ${basePort}-${basePort + maxPortAttempts - 1}. ` +
						`Set PORT to a free port and retry.`
				);
				process.exit(1);
			}
			startServer(port + 1, attempt + 1);
			return;
		}
		throw err;
	});

	server.listen(port, () => {
		console.log(`Pokemon Calculator running at http://localhost:${port}/dist/`);
	});
}

startServer(basePort);
