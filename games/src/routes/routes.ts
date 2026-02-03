
import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';
import { wsHandler } from '../ws/ws_handler';
import { pongRoutesManager } from '../routes/pongRoutesManager';

function registerWSRoutes(server: FastifyInstance) {
   server.get('/ws/games/', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
		console.log(" /register-player WS hit");
		wsHandler(connection, req);
	});

}

function registerPongRoutes(server: FastifyInstance) {
	server.post('/api/games/pong', async (req: FastifyRequest, reply: FastifyReply) => {
		console.log(" /api/games/pong POST hit");
		pongRoutesManager(req, reply);
	});
}

function registerGamesRoutes(server: FastifyInstance) {
	registerWSRoutes(server)
	registerPongRoutes(server);

}

export { registerGamesRoutes };