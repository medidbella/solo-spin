
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';
import { WebSocket } from 'ws';

import { getPlayer, isPlayerExist, registerNewPlayer, resetPlayerStatesIfAlreadyExist } from '../game_manager/games_utiles';
import { ClientMessage, ServerMessage, WSPongStartGameMessage, WSMsgType, PongSessionData,
			WSPongInput, PongInput, inputPlayer,
			WSPongResumeMessage,
			WSPongPauseMessage, WSPongBreakMessage, GameMode, PongSessionStop,
			Breaker
 		} from '../../../shared/types'

import { PINGTIMEOUT } from '../../../shared/pong_constants';

import { pongEngine, pongGameSessionsRoom } from '../pong/pong_memory';
import { PongSession, PongPlayer } from '../pong/pong_types';
import { GamesPlayer } from '../game_manager/games_types';
import { getBreaker } from '../game_manager/games_utiles';
// import { onlinePlayersRooom } from "../game_manager/games_memory";
// import { Session } from "inspector/promises";
// import { stat } from "fs";


function sendWSMsg(results: ServerMessage, session: PongSession) {
	// 1. here are 2 players
    if (session.players.length !== 2) {
		// console.log("  ==> size problem");
		return;
	}

    // 2. Get IDs
    const p1ID = session.players[0].playerId;
    const p2ID = session.players[1].playerId;

	// 3. get Pong players
    const player1: GamesPlayer = getPlayer(p1ID);
    const player2: GamesPlayer = getPlayer(p2ID);

	// console.log(`  p1 id: ${p1ID} || p2 id: ${p2ID} || breaker: ${session.breaker} || Msg type: ${results.type }`);

    // 4. Send to Player 1
    if (session.breaker !== 'p1' && player1 && player1.ws) {
        player1.ws.send(JSON.stringify(results));
        // console.log(`  -> Sent to P1 (${player1.playerName})`);
    }

    // 5. Send to Player 2
    if (session.breaker !== 'p2' && player2 && player2.ws) {
        player2.ws.send(JSON.stringify(results));
        // console.log(`  -> Sent to P2 (${player2.playerName})`);
    }
}

function connectPlayer(playerId: string, playerName: string, socket: WebSocket) {
	// console.log(` player id ==> ${playerId}`);
	// console.log(`👤 New User wants to be Regitered`);
	registerNewPlayer(playerId, playerName, socket);
}

function startPongGame(playerId: string, parsedMessage: ClientMessage) {
	parsedMessage = parsedMessage as WSPongStartGameMessage;
	// console.log(`   ###### Got start pong game message gameId: ${parsedMessage.payload.gameId} #####`);

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

function breakPongGame(playerId: string, parsedMessage: ClientMessage | null, playerSession: PongSession | null, state: 'BREAK') {

	let session: PongSession | undefined;

	if (parsedMessage) {	
		parsedMessage = parsedMessage as WSPongBreakMessage;
		const sessionId: string = parsedMessage.payload.sessionId;
		if (!sessionId)
			return ;
		
		session = pongGameSessionsRoom.getSession(sessionId);
		if (!session)
			return ;
	} 
	else
		session = playerSession as PongSession; 

	const gameMode: GameMode | null = session.gameMode;
	if (gameMode === 'local') {
		// console.log("  **** Local Case ******");
		pongGameSessionsRoom.endGame(session.sessionId, gameMode);

	} else if (gameMode === 'remote') {
		// console.log("  **** Breaking the game: Remote Case ******");
		session.breaker = (session.players[0].playerId === playerId) ? 'p1' : 'p2'; 
		// console.log(`  ## Breaker: ${session.breaker}  ### `);
		const breakMsg : PongSessionData = pongEngine.createResutlsMsg(session);
		// console.log(`  ***  Trying to send Break message to the winner (breaker: ${session.breaker}) **** `);
		sendWSMsg(breakMsg, session);
		pongGameSessionsRoom.endGame(session.sessionId, gameMode);
	}
}

async function wsHandler(connection: SocketStream, req: FastifyRequest) {
	console.log(' Server: 🔌 New WebSocket connection established');
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
            // console.log(" ==> sub (User ID): ", playerId);

			if (isPlayerExist(playerId)) {

				const player: GamesPlayer = getPlayer(playerId);

				// Check if they have an EXISTING, OPEN socket
				if (player.ws && player.ws.readyState === WebSocket.OPEN) {
					console.log(`⚠️ Duplicate detected for ${playerId}. Kicking old socket...`);
					console.log(`   ### player State: ${player.playerState}  ### `);

					// 1. Notify the old socket (Optional but polite)
					player.ws.send(JSON.stringify({
						type: 'ERROR',
						payload: { error: 'Multiple Tabs Detected', message: 'New login from another tab.' }
					}));

					if (player.playerState === 'PLAYING' ) {

						
						if (player.pongPlayer && player.pongPlayer.sessiondId) {
							const session: PongSession | undefined = pongGameSessionsRoom.getSession(player.pongPlayer.sessiondId);
							if (session) {
								session.stop = true;

								console.log(`  *** Set Stop to : ${session.stop} *** ` );

								// variable = (condition) ? valueIfTrue : valueIfFalse;
								session.breaker = getBreaker(session, playerId);
								console.log(`  Breaker:   ${session.breaker}   `);
								// if (session.gameMode === 'local') {
									console.log(' ===>>> Debugin end Game <<<====');
									await pongGameSessionsRoom.endGame(player.pongPlayer.sessiondId, session.gameMode);
									console.log(' ===>>> finish end Game <<<====');

								// 	console.log(' ===>>> Debugin-3 <<<====');


								// 	const stopMsg = pongEngine.createStopGameMsg(player.pongPlayer.sessiondId);
								// 	console.log(' ===>>> Debugin-4 <<<====');
									
								// 	console.log(`  ***  Trying to send Stop message **** `);
								// 	// sendWSMsg(stopMsg, session);
								// 	player.ws.send(JSON.stringify(stopMsg));

								// } else if (session.gameMode === 'remote') {

								// }
							}
						}
					}

					// 2. Remove listeners from old socket to prevent triggering 'onclose' cleanup logic
                	// (This prevents the 'onclose' below from deleting the player entirely)
                	player.ws.removeAllListeners();

					// 3. Kill it
					player.ws.terminate();
					console.log(" ==> Kill the old socker <==");

					console.log(`  Server:  player State: ${player.playerState}  `);
				}
					
				// 4. Assign the NEW socket
				player.ws = socket;
				player.isWsAlive = true;
				// A. Mark connection as alive initially
				console.log(`✅ Socket updated for player ${playerId}`);

				// 5. Reset states (if they were in a game, reconnect or finish the game 'not made the behavior yet !!!' )
           		resetPlayerStatesIfAlreadyExist(playerId);
			}

            
        } catch (err) {
			// console.log("Invalid Token");
			socket.close(1008, "Invalid Token");
			return;
        }
	// }

	const playerName: string = req.cookies.playerName as string; // !!!!!!


	socket.on('message', (rawData: any) => {

		setWsIsAlive(playerId);

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
			const type: WSMsgType = parsedMessage.type as WSMsgType;
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

				case 'BREAK':
					breakPongGame(playerId!, parsedMessage, null, 'BREAK');
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

	socket.on('pong', () => {
        if (playerId && isPlayerExist(playerId)) {
            const player: GamesPlayer = getPlayer(playerId);
			player.isWsAlive = true;

		}
    //    console.log("Received Pong from client");
    });


	socket.on('close', () => {

		console.log("  ==> Cathing Socket on Close Event  <== ");

		if (playerId && isPlayerExist(playerId)) {
            const player: GamesPlayer = getPlayer(playerId);
			
            // Only remove the player if the socket closing is the CURRENT one.
			if (player.ws === socket) {
                // console.log(`👋 Player ${playerId} disconnected.`);
                // Clean up logic (remove from online list, lose the game if playing ...)
                // onlinePlayersRooom.delete(playerId);
            } else {
                // console.log(` Old socket for ${playerId} closed (Ignored).`);
            }

		}

	});

	socket.on('error', (err) => {
		console.log("  ==> Cathing Socket on Error Event  <== ");
		console.error(`❌ WS Error for ${playerId}:`, err);
	});
	
}

function setWsIsAlive(playerId: string) {

	const player: GamesPlayer = getPlayer(playerId);
	if (player)
        player.isWsAlive = true;
}

export { wsHandler, sendWSMsg, breakPongGame };