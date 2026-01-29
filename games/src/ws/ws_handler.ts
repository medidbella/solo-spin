
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';
import { WebSocket } from 'ws';

import { getPlayer, registerNewPlayer } from '../game_manager/games_utiles';
import { ClientMessage, ServerMessage, WSPongStartGameMessage, WSMsgType, PongSessionData,
			WSPongInput, PongInput, inputPlayer
 		} from '../../../shared/types'

import { pongEngine, pongGameSessionsRoom } from '../pong/pong_memory';
import { PongSession, PongPlayer } from '../pong/pong_types';
import { GamesPlayer } from '../game_manager/games_types';


function sendWSMsg(results: PongSessionData, session: PongSession) {
	const player1: GamesPlayer = getPlayer(session.players[0].playerId);
	const player2: GamesPlayer = getPlayer(session.players[0].playerId);

	const ws1: WebSocket = player1.ws as WebSocket;
	let ws2: WebSocket | null = null;
	if (player2)
		ws2 = player2.ws as WebSocket;

	ws1.send(JSON.stringify(results));
	if (ws2)
		ws2.send(JSON.stringify(results));
}

function connectPlayer(playerId: string, playerName: string, socket: WebSocket) {
	console.log(` player id ==> ${playerId}`);
	console.log(`👤 New User wants to be Regitered`);
	registerNewPlayer(playerId, playerName, socket);
}

function startPongGame(playerId: string, parsedMessage: ClientMessage) {
	parsedMessage = parsedMessage as WSPongStartGameMessage;
	console.log(`   ### Got start pong game message gameId: ${parsedMessage.payload.gameId} ###`);

	pongGameSessionsRoom.startGame(parsedMessage.payload.gameId);

}

function pongGameMovements(playerId: string, parsedMessage: WSPongInput) {
	// console.log(`🎮 Move received:`, parsedMessage.payload);
		// Handle game move...

	
	const sessionId: string = parsedMessage.payload.gameId;
	if (!sessionId)
		return ;

	const session: PongSession | undefined = pongGameSessionsRoom.getSession(sessionId);
	if (!session)
		return ;

	const move: PongInput = parsedMessage.payload.move;
	const inputPlayer: inputPlayer = parsedMessage.payload.inputPlayer;

	let player: PongPlayer;
	if (inputPlayer === 'LEFT')
		player = session.players[0];
	else
		player = session.players[1];

	pongEngine.updatePaddles(session, player, move);
	// sendWSMsg(pongEngine.gameTick(session), session);
	
}

function wsHandler(connection: SocketStream, req: FastifyRequest) {
	console.log('🔌 New WebSocket connection established');
	// console.log('🔌 ');

	const socket: WebSocket = connection.socket;
	let playerId: string | undefined;

	// const playerId: string = req.cookies.playerId as string;
	const token: string | undefined = req.cookies.accessToken;
	console.log(" ==> token: ", token);


	if (token) {
		try {
            // STEP 1: Verify/Decode the token string into an object
            // Use the same tool you used to sign it (req.server.jwt)
            const decoded = req.server.jwt.verify(token) as { sub: string };

            // STEP 2: Now you can read the data
            playerId = decoded.sub;
            console.log(" ==> sub (User ID): ", playerId);
            
        } catch (err) {
            console.log("Token is invalid or expired");

			const errorMsg: ServerMessage = {
				type: 'CONNECT_ERROR',
				payload: { error: 'Authentication missing. Please log in.' }
			};
			socket.send(JSON.stringify(errorMsg));
			socket.close(); // Close connection
			return;
        }
	}

	const playerName: string = req.cookies.playerName as string; // !!!!!!

	// // 🛡️ SECURITY 1: Reject immediately if no ID found during handshake
	// if (!playerId || !playerName) {
	// 	if (!playerId)
	// 		console.warn("❌ Connection rejected: Missing cookie ID");
	// 	else
	// 		console.warn("❌ Connection rejected: Missing cookie Name");
	// 	const errorMsg: ServerMessage = {
	// 		type: 'CONNECT_ERROR',
	// 		payload: { error: 'Authentication missing. Please log in.' }
	// 	};
	// 	socket.send(JSON.stringify(errorMsg));
	// 	socket.close(); // Close connection
	// 	return;
	// }



	socket.on('message', (rawData: any) => {
		try {
			// 1. Convert Buffer to String
			const messageString = rawData.toString();

			// 2. Parse JSON
			// We use 'any' temporarily to safely check if it's an object
			const parsedMessage: ClientMessage = JSON.parse(messageString);

			// 🛡️ SAFETY CHECK: Ensure it's a valid object and not null
			if (!parsedMessage || typeof parsedMessage !== 'object') {
				throw new Error("Invalid message format: Not an object");
			}

			// 3. Handle based on type
			const type: WSMsgType = parsedMessage.type;
			switch (type) {
				case 'CONNECT':
					connectPlayer(playerId!, playerName, socket);
					break;
				
				case 'START_GAME':
					startPongGame(playerId!, parsedMessage);
					break;
					
				case 'GAME_INPUT':
					pongGameMovements(playerId!, parsedMessage as WSPongInput);
					break;

				default:
					console.warn(`⚠️ Unknown message type received: ${type}`);
					// 🗣️ Feedback to Client: "I don't understand this type"
					if (socket.readyState === socket.OPEN) {
						socket.send(JSON.stringify({ 
							type: 'ERROR', 
							payload: { error: `Unknown message type: ${type}` } 
						}));
					}
			}
	
		} catch (error) {
			console.error("❌ Failed to process message:", error);
			
			// 🗣️ Feedback to Client: "Your JSON was bad"
			if (socket.readyState === socket.OPEN) {
				socket.send(JSON.stringify({
					type: 'ERROR',
					payload: { error: "Invalid JSON or Malformed Request" }
				}));
			}
		}
	});

	// const response = {
	//     message: 'Hello from the server!!',
	// };
	
	// console.log('📤 Sending AUTH_SUCCESS:', response);
	// socket.send(JSON.stringify(response));
	
}

export { wsHandler, sendWSMsg };