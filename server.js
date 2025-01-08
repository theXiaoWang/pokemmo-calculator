const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the dist directory
app.use(express.static('dist'));

// Serve the main page
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/dist/index.html');
});

app.listen(port, () => {
	console.log(`Pokemon Calculator running at http://localhost:${port}`);
});
