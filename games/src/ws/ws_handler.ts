
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';
import { WebSocket } from 'ws';

import { registerNewPlayer } from '../game_manager/games_utiles';
import { ClientMessage, ServerMessage, WSMsgType } from '../../../shared/types'

function connectPlayer(playerId: string, playerName: string, socket: WebSocket) {
	console.log(` player id ==> ${playerId}`);
	console.log(`👤 New User wants to be Regitered`);
	registerNewPlayer(playerId, playerName, socket);
}

function startPongGame(playerId: string, parsedMessage: ClientMessage) {
	console.log(`   ### Got start pong game message gameId: ${parsedMessage.payload} ###`);
}

function pongGameMovements(playerId: string, parsedMessage: ClientMessage) {
	console.log(`🎮 Move received:`, parsedMessage.payload);
		// Handle game move...
}

function wsHandler(connection: SocketStream, req: FastifyRequest) {
	console.log('🔌 New WebSocket connection established');

	const socket: WebSocket = connection.socket;
	const playerId: string = req.cookies.playerId as string;
	const playerName: string = req.cookies.playerName as string;

	// 🛡️ SECURITY 1: Reject immediately if no ID found during handshake
	if (!playerId || !playerName) {
		if (!playerId)
			console.warn("❌ Connection rejected: Missing cookie ID");
		else
			console.warn("❌ Connection rejected: Missing cookie Name");
		const errorMsg: ServerMessage = {
			type: 'CONNECT_ERROR',
			payload: { error: 'Authentication missing. Please log in.' }
		};
		socket.send(JSON.stringify(errorMsg));
		socket.close(); // Close connection
		return;
	}



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
					connectPlayer(playerId, playerName, socket);
					break;
				
				case 'START_GAME':
					startPongGame(playerId, parsedMessage);
					break;
					
				case 'GAME_INPUT':
					pongGameMovements(playerId, parsedMessage);
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

export { wsHandler };