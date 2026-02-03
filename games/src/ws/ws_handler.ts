
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';
import { WebSocket } from 'ws';
import { getPlayer, isPlayerExist, registerNewPlayer, resetPlayerStatesIfAlreadyExist } from '../game_manager/games_utiles';
import { ClientMessage, ServerMessage, WSPongStartGameMessage, WSMsgType, PongSessionData,
			WSPongInput, PongInput, inputPlayer,
			WSPongResumeMessage,
			WSPongPauseMessage, WSPongBreakMessage, GameMode
 		} from '../../../shared/types'
import { pongEngine, pongGameSessionsRoom } from '../pong/pong_memory';
import { PongSession, PongPlayer } from '../pong/pong_types';
import { GamesPlayer } from '../game_manager/games_types';
import { getBreaker } from '../game_manager/games_utiles';

function sendWSMsg(results: ServerMessage, session: PongSession) {
    if (session.players.length !== 2)
		return;

    const p1ID = session.players[0].playerId;
    const p2ID = session.players[1].playerId;

    const player1: GamesPlayer = getPlayer(p1ID);
    const player2: GamesPlayer = getPlayer(p2ID);


    if (session.breaker !== 'p1' && player1 && player1.ws)
        player1.ws.send(JSON.stringify(results));

    if (session.breaker !== 'p2' && player2 && player2.ws)
        player2.ws.send(JSON.stringify(results));
}

function connectPlayer(playerId: string, playerName: string, socket: WebSocket) {
	registerNewPlayer(playerId, playerName, socket);
}

function startPongGame(playerId: string, parsedMessage: ClientMessage) {
	parsedMessage = parsedMessage as WSPongStartGameMessage;
	pongGameSessionsRoom.startGame(parsedMessage.payload.gameId, playerId);
}

function pongGameMovements(playerId: string, parsedMessage: WSPongInput) {
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
		pongGameSessionsRoom.endGame(session.sessionId, gameMode);
	} else if (gameMode === 'remote') {
		session.breaker = (session.players[0].playerId === playerId) ? 'p1' : 'p2'; 
		const breakMsg : PongSessionData = pongEngine.createResutlsMsg(session);
		sendWSMsg(breakMsg, session);
		pongGameSessionsRoom.endGame(session.sessionId, gameMode);
	}
}

async function wsHandler(connection: SocketStream, req: FastifyRequest) {
	console.log(' Server: 🔌 New WebSocket connection established');

	const socket: WebSocket = connection.socket;
	let playerId: string | undefined;

    const token: string | undefined = req.cookies.accessToken;
    if (!token) {
        socket.close(1008, "Authentication required");
        return;
    }

	try {
        const decoded = req.server.jwt.verify(token) as { sub: string };
        playerId = decoded.sub;

		console.log( `  >>> Is player exist: ${isPlayerExist(playerId)} <<<< `);

		if (isPlayerExist(playerId)) {

			const player: GamesPlayer = getPlayer(playerId);
			if (player.ws && player.ws.readyState === WebSocket.OPEN) {
				console.log(`⚠️ Duplicate detected for ${playerId}. Kicking old socket...`);
				console.log(`   ### player State: ${player.playerState}  ### `);

				player.ws.send(JSON.stringify({
					type: 'ERROR',
					payload: { error: 'Multiple Tabs Detected', message: 'New login from another tab.' }
				}));

				if (player.playerState === 'PLAYING' ) {
					if (player.pongPlayer && player.pongPlayer.sessiondId) {
						const session: PongSession | undefined = pongGameSessionsRoom.getSession(player.pongPlayer.sessiondId);
						if (session) {
							session.stop = true;
							session.breaker = getBreaker(session, playerId);
							console.log(`  Breaker:   ${session.breaker}   `);
							// console.log(' ===>>> Debugin end Game <<<====');
							await pongGameSessionsRoom.endGame(player.pongPlayer.sessiondId, session.gameMode);
							// console.log(' ===>>> finish end Game <<<====');
						}
					}
				}

                player.ws.removeAllListeners();
				player.ws.terminate();
			}
					
			player.ws = socket;
			player.isWsAlive = true;
			console.log(`✅ Socket updated for player ${playerId}`);
           	resetPlayerStatesIfAlreadyExist(playerId);
		}

            
    } catch (err) {
		// console.log("Invalid Token");
		socket.close(1008, "Invalid Token");
		return;
    }

	const playerName: string = req.cookies.playerName as string;
	socket.on('message', (rawData: any) => {

		setWsIsAlive(playerId);

		try {
			const messageString = rawData.toString();
			const parsedMessage: ClientMessage = JSON.parse(messageString);

			if (!parsedMessage || typeof parsedMessage !== 'object') {
				throw new Error("Invalid message format: Not an object");
			}

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
					if (socket.readyState === socket.OPEN) {
						socket.send(JSON.stringify({ 
							type: 'ERROR', 
							payload: { error: `Unknown message type: ${type}` } 
						}));
					}
			}
	
		} catch (error) {
			console.error("❌ Failed to process message:", error);

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
    });


	socket.on('close', () => {

		console.log("  ==> Cathing Socket on Close Event  <== ");
		if (playerId)
			pongGameSessionsRoom.startDeletePlayerTimeOut(playerId);

	});

	socket.on('error', (err: any) => {
		if (playerId)
			pongGameSessionsRoom.startDeletePlayerTimeOut(playerId);
	});
}

function setWsIsAlive(playerId: string) {

	const player: GamesPlayer = getPlayer(playerId);
	if (player)
        player.isWsAlive = true;
}

export { wsHandler, sendWSMsg, breakPongGame };