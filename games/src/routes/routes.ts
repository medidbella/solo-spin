
import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';

// import { registerNewPlayer } from '../game_manager/games_utiles';
import { wsHandler } from '../ws/ws_handler';

function registerGamesPlayers(server: FastifyInstance) {
	
   // We use .get() because WebSocket handshakes start as HTTP GET requests
   server.get('/ws/games/', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
		console.log("📝 /register-player WS hit");

		wsHandler(connection, req);

		// // regardless of what the object actually is.
        // const debugConnection = connection as any;

        // console.log("Constructor Name:", debugConnection.constructor.name);
        
        // // Now this won't cause a compile error
        // if (debugConnection.headers) {
        //     console.log("Headers:", debugConnection.headers);
        // }
		
		// // 'connection.socket' is the actual WebSocket object we use to talk
		// const socket = connection.socket;

		// console.log('🔌 New WebSocket connection established');
		// console.log('🔌 Connection state:', socket.readyState);
		// console.log('🔌 Protocol:', socket.protocol);

		// const playerId: string = req.cookies.playerId as string;
		// if (!playerId) {
		// 	console.log(" Need ID !!!");
		// } else {
		// 	registerNewPlayer(playerId, socket);
		// 	console.log(`create new player ID: ${playerId}`);
		// }

		// socket.on('message', (data: any) => {
		// 	console.log("received data:", data);
		// });

		// const response = {
		// 	message: 'Hello from the server!!',
		// };
		
		// console.log('📤 Sending AUTH_SUCCESS:', response);
		// socket.send(JSON.stringify(response));
		



		// 1. no need for body
		// 2. get name + id from cookies
		// 3. create the new player
		// 4. add player to online players room + available players room
		// 4. set web socket
	});
}


function registerGamesRoutes(server: FastifyInstance) {

	registerGamesPlayers(server); // set ws
	
	// registerPongRoutes(server); // define pong routes
	// registerSudokuRoutes(server); // define sudoku routes

}


export { registerGamesRoutes };