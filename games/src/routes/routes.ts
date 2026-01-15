
import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';

// import { registerNewPlayer } from '../game_manager/games_utiles';
import { wsHandler } from '../ws/ws_handler';
import { pongRoutesManager } from '../routes/pongRoutesManager';

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
		pongRoutesManager(req, reply);
	});
}

function registerSudokuRoutes(server: FastifyInstance) {
	server.post('/api/games/sudoku', async (req: FastifyRequest, reply: FastifyReply) => {
		console.log("📝 /api/games/sudoku POST hit"); // log immediately
		// sudokuRoutesManager(req, reply);
	});
}


function registerGamesRoutes(server: FastifyInstance) {

	// registerGamesPlayers(server); // set ws
	
	registerWSRoutes(server)
	registerPongRoutes(server); // define pong routes
	registerSudokuRoutes(server); // define sudoku routes

}


export { registerGamesRoutes };