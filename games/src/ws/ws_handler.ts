
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';
import { WebSocket } from 'ws';

import { getPlayer, isPlayerExist, registerNewPlayer, resetPlayerStatesIfAlreadyExist } from '../game_manager/games_utiles';
import { ClientMessage, ServerMessage, WSPongStartGameMessage, WSMsgType, PongSessionData,
			WSPongInput, PongInput, inputPlayer,
			WSPongResumeMessage,
			WSPongPauseMessage
 		} from '../../../shared/types'

import { pongEngine, pongGameSessionsRoom } from '../pong/pong_memory';
import { PongSession, PongPlayer } from '../pong/pong_types';
import { GamesPlayer } from '../game_manager/games_types';
import { stat } from "fs";


function sendWSMsg(results: ServerMessage, session: PongSession) {
	// 1. here are 2 players
    if (session.players.length !== 2) return;

    // 2. Get IDs
    const p1ID = session.players[0].playerId;
    const p2ID = session.players[1].playerId;

	// 3. get Pong players
    const player1: GamesPlayer = getPlayer(p1ID);
    const player2: GamesPlayer = getPlayer(p2ID);

    // 4. Send to Player 1
    if (player1 && player1.ws) {
        player1.ws.send(JSON.stringify(results));
        // console.log(`  -> Sent to P1 (${player1.playerName})`);
    }

    // 5. Send to Player 2
    if (player2 && player2.ws) {
        player2.ws.send(JSON.stringify(results));
        // console.log(`  -> Sent to P2 (${player2.playerName})`);
    }
}

function connectPlayer(playerId: string, playerName: string, socket: WebSocket) {
	// console.log(` player id ==> ${playerId}`);
	console.log(`👤 New User wants to be Regitered`);
	registerNewPlayer(playerId, playerName, socket);
}

function startPongGame(playerId: string, parsedMessage: ClientMessage) {
	parsedMessage = parsedMessage as WSPongStartGameMessage;
	console.log(`   ###### Got start pong game message gameId: ${parsedMessage.payload.gameId} #####`);

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

function pongGamestate(playerId: string, parsedMessage: ClientMessage, state: 'PAUSE' | 'RESUME') {
	if (state === 'PAUSE') {
		parsedMessage = parsedMessage as WSPongPauseMessage;

		const sessionId: string = parsedMessage.payload.sessionId;
		if (!sessionId)
			return ;

		const session: PongSession | undefined = pongGameSessionsRoom.getSession(sessionId);
		if (!session)
			return ;

		session.state = 'PAUSE';

	} else {

		parsedMessage = parsedMessage as WSPongResumeMessage;

		const sessionId: string = parsedMessage.payload.sessionId;
		if (!sessionId)
			return ;

		const session: PongSession | undefined = pongGameSessionsRoom.getSession(sessionId);
		if (!session)
			return ;

		session.state = 'playing';
	}
}

function handlerWsOnCloseAndError(playerId: string | undefined, connection: SocketStream) {
	// 1. Check if this player is already Exist !!
	if (playerId && isPlayerExist(playerId)) {
		const player: GamesPlayer = getPlayer(playerId);

		// clear ws-related
		if (player.ws) {

			console.log(`  ---  New WS === Old WS : ${(connection.socket == player.ws)}  --- `)

			console.log(`⚠️ Duplicate connection detected for ${playerId}. Closing old socket...`);
			
			// Remove listeners
			player.ws.removeAllListeners();

			// B. Force close the OLD connection
			player.ws.terminate(); // terminate() is harder/faster than .close()
			console.log(`  Close the old Ws of the playerId: ${playerId}  `);
		}

		// 2. Create/Update the Player Object with the NEW Socket
		// Just update the socket reference
		player.ws = connection.socket;
		console.log(`✅ Updated socket for player ${playerId}`);
		resetPlayerStatesIfAlreadyExist(playerId);
	}
}

function wsHandler(connection: SocketStream, req: FastifyRequest) {
	console.log('🔌 New WebSocket connection established');
	// console.log('🔌 ');

	const socket: WebSocket = connection.socket;
	let playerId: string | undefined;

	// // const playerId: string = req.cookies.playerId as string;
	// const token: string | undefined = req.cookies.accessToken;
	// // console.log(" ==> token: ", token);

	// 1. Authenticate
    const token: string | undefined = req.cookies.accessToken;
    if (!token) {
        socket.close(1008, "Authentication required");
        return;
    }


	// if (token) {
		try {
            // STEP 1: Verify/Decode the token string into an object
            // Use the same tool you used to sign it (req.server.jwt)
            const decoded = req.server.jwt.verify(token) as { sub: string };

            // STEP 2: Now you can read the data
            playerId = decoded.sub;
            console.log(" ==> sub (User ID): ", playerId);

			if (isPlayerExist(playerId)) {

				const player: GamesPlayer = getPlayer(playerId);

				// Check if they have an EXISTING, OPEN socket
				if (player.ws && player.ws.readyState === WebSocket.OPEN) {
					console.log(`⚠️ Duplicate detected for ${playerId}. Kicking old socket...`);

					// 1. Notify the old socket (Optional but polite)
					player.ws.send(JSON.stringify({
						type: 'ERROR',
						payload: { error: 'Multiple Tabs Detected', message: 'New login from another tab.' }
					}));

					// 2. Remove listeners from old socket to prevent triggering 'onclose' cleanup logic
                	// (This prevents the 'onclose' below from deleting the player entirely)
                	player.ws.removeAllListeners();

					// 3. Kill it
					player.ws.terminate();
				}
					
				// 4. Assign the NEW socket
				player.ws = socket;
				console.log(`✅ Socket updated for player ${playerId}`);

				// 5. Reset states (if they were in a game, reconnect or finish the game 'not made the behavior yet !!!' )
           		resetPlayerStatesIfAlreadyExist(playerId);
			}


		
			// 1. Check if this player is already Exist !!
			// if (isPlayerExist(playerId)) {
			// 	const player: GamesPlayer = getPlayer(playerId);

			// 	// clear ws-related
			// 	if (player.ws) {

			// 		console.log(`⚠️ Duplicate connection detected for ${playerId}. Closing old socket...`);
					
			// 		// Remove listeners
			// 		player.ws.removeAllListeners();

			// 		// B. Force close the OLD connection
			// 	    player.ws.terminate(); // terminate() is harder/faster than .close()
			// 		console.log(`  Close the old Ws of the playerId: ${playerId}  `);
			// 	}

			// 	// 2. Create/Update the Player Object with the NEW Socket
			// 	// Just update the socket reference
			// 	player.ws = connection.socket;
			// 	console.log(`✅ Updated socket for player ${playerId}`);
			// }
            
        } catch (err) {
			console.log("Invalid Token");
			socket.close(1008, "Invalid Token");
			return;
        }
	// }

	const playerName: string = req.cookies.playerName as string; // !!!!!!


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

				case 'PAUSE':
					pongGamestate(playerId!, parsedMessage, 'PAUSE');
					break;
				
				case 'RESUME':
					pongGamestate(playerId!, parsedMessage, 'RESUME');
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


	socket.on('close', () => {
		if (playerId && isPlayerExist(playerId)) {
            const player: GamesPlayer = getPlayer(playerId);
			
            // Only remove the player if the socket closing is the CURRENT one.
			if (player.ws === socket) {
                console.log(`👋 Player ${playerId} disconnected.`);
                // Clean up logic (remove from online list, lose the game if playing ...)
                // onlinePlayersRooom.delete(playerId);
            } else {
                console.log(` Old socket for ${playerId} closed (Ignored).`);
            }

		}

	});

	socket.on('error', (err) => {
		console.error(`❌ WS Error for ${playerId}:`, err);
	});
	
}

export { wsHandler, sendWSMsg };