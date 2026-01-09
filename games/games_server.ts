import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import webSocket from '@fastify/websocket';
import cors from '@fastify/cors';

import { registerGamesRoutes } from "./src/routes/routes";

const server: FastifyInstance = Fastify( { logger: true });

server.register(cookie);

server.register(webSocket);

// Register CORS
server.register(cors, {
	origin: true, // Allow all origins in development
	credentials: true
});

// registerGamesRoutes(server);

server.register(async (childServer: FastifyInstance) => {
    registerGamesRoutes(childServer);
});

const start = async () => {
	try {
		// Start listening for HTTP requests
        const port = Number(process.env.GAMES_PORT) || 3002;
        const host: string = "0.0.0.0";
		await server.listen({ port, host });
		console.log(`✅ Games service is running on http://0.0.0.0:${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

// Execute the start function to begin listening
start();