
import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';

// import { registerNewPlayer } from '../game_manager/games_utiles';
import { wsHandler } from '../ws/ws_handler';

function gameModeRouteHandler(req: FastifyRequest, reply: FastifyReply) {

}

function playModeRouteHandler(req: FastifyRequest, reply: FastifyReply) {

}

function friendNameRouteHandler(req: FastifyRequest, reply: FastifyReply) {

}


function registerWSRoutes(server: FastifyInstance) {
	
   // We use .get() because WebSocket handshakes start as HTTP GET requests
   server.get('/ws/games/', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
		console.log("📝 /register-player WS hit");
		wsHandler(connection, req);
	});

}

function registerPongRoutes(server: FastifyInstance) {
	server.post('/api/games/pong', async (req: FastifyRequest, reply: FastifyReply) => {
		console.log("📝 /api/games/pong POST hit"); // log immediately
		pongGameManager(req, reply);
	});
}


function registerGamesRoutes(server: FastifyInstance) {

	// registerGamesPlayers(server); // set ws
	
	registerWSRoutes(server)
	registerPongRoutes(server); // define pong routes
	// registerSudokuRoutes(server); // define sudoku routes

}


export { registerGamesRoutes };