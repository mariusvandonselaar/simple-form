const express = require('express');
const path = require('path');
const api = require('./api.js');

// An all purpose error reporting html
const htmlerror = (errorcode) => `
	<style>
		body {
			background: #202020 url("https://http.cat/${errorcode}") no-repeat center center fixed;
			background-size: contain;
		}
	</style>
`;

// Initiate express app
// (normally i'd use nginx for top level routing, load balancing, serving static files as well as offloading TLS)
const app = express();

// Set the port the server is going to be listening on
app.set('port', 8080)

// Log all requests
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

// Handle api calls
app.use('/api', api);

// Handle static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Handle route misses
app.use((req, res, next) => res.status(404).send(htmlerror(404)));

// Handle miscellaneous errors
app.use((err, req, res, next) => res.status(500).send(htmlerror(500)));

// Start a listening server on the defined port
app.listen(app.get('port'), () => {
	console.log(`Server started listening on port ${app.get('port')}`);
});