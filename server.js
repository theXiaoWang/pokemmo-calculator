const express = require('express');
const path = require('path');
const app = express();

function normalizePort(value, fallback) {
	const parsed = Number.parseInt(String(value ?? ''), 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const defaultPort = 5000;
const requestedPort = process.env.PORT;
const basePort = normalizePort(requestedPort, defaultPort);
const maxPortAttempts = 20;

// Serve static files from the dist directory
const distDir = path.join(__dirname, 'dist');
app.use('/dist', express.static(distDir));
app.use(express.static(distDir));

// Serve the main page
app.get('/', (req, res) => {
	res.redirect('/dist/');
});

function startServer(port, attempt = 0) {
	const server = app.listen(port, () => {
		console.log(`Pokemon Calculator running at http://localhost:${port}/dist/`);
	});

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
}

startServer(basePort);
