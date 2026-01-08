import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import webSocket from '@fastify/websocket';
import cors from '@fastify/cors';

import { registerPongRoutes } from "./src/routes/routes";

const server: FastifyInstance = Fastify( { logger: true });

server.register(cookie);

server.register(webSocket);

// Register CORS
server.register(cors, {
	origin: true, // Allow all origins in development
	credentials: true
});

registerPongRoutes(server);

const start = async () => {
	try {
		// Start listening for HTTP requests
        const port = Number(process.env.PORT) || 3002;
        const host: string = "0.0.0.0";
		await server.listen({ port, host });
		console.log(`✅ Game service is running on http://0.0.0.0:${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

// Execute the start function to begin listening
start();