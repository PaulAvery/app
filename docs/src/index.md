# Minimal application framework
This module provides the absolute basics to create an application. It gives you the following:

1. [Structure via Components](Components.md)
2. [Central event handling](Events.md)
3. [Configuration loading](Configuration.md)
4. [Logging](Logging.md)

And that's it. Just the basics:

```js
import { Server as WebSocketServer } from 'ws';
import express from 'express';
import App from '@paulavery/app';

/* A component which simply starts a websocket server */
function socketServer(app, config) {
	let server = new WebSocketServer({ port: config.port });

	server.on('connection', socket => {
		app.logger.trace('connection');

		socket.on('message', message => {
			app.logger.trace('message', {message: message});
		});
	});

	return server;
}

/* Set the default config for the socket server */
socketServer.config = { port: 81 };

/* A component which starts a webserver and sends events to all websocket clients on each request */
function webServer(app, config) {
	let server = express();

	server.use('*', (req, res, next) => {
		let data = { method: req.method, path: req.originalUrl };

		app.logger.trace(`${req.method}: ${req.path}`, data);
		app.socketServer.clients.forEach(client => client.send(JSON.stringify(data)));

		next();
	});

	app.on('app:boot', () => server.listen(config.port));

	return server;
}

/* Set the default config for the express server */
webServer.config = { port: 80 };

new App('my-app')
	.register(webServer)
	.register(socketServer)
	.boot();

```
