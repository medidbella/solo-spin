
// import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";

import { HttpPongSetupReq, HttpSetupResponse } from '../../../shared/types';
import { createHttpSuccessResponseBody, createHttpErrorResponseBody } from '../pong/pong_utils';

import { createLocalPongSession } from '../pong/pong_session';
import { initializePlayerGameContext, prepareLocalPlayers } from '../game_manager/games_utiles';

import { GamesPlayer } from "../game_manager/games_types";
import { isPlayerExist, getPlayer } from '../game_manager/games_utiles';

import { pongEngine, pongGameSessionsRoom } from '../pong/pong_memory';
// import { sendWSMsg } from '../ws/ws_handler';

function localMode(playerId: string, body: HttpPongSetupReq, reply: FastifyReply) {
	
	// console.log(" ## Local Mode ###");

	// Check Player 2
	if (!body.player2 || body.player2.trim() === "") {
		const resBody: HttpSetupResponse = createHttpErrorResponseBody('Local mode requires a name for Player 2.');
		return reply.status(400).send(resBody);
	}

	// Check Duplicate Names
	if (body.player1 === body.player2) {
		const resBody: HttpSetupResponse = createHttpErrorResponseBody('Players must have different names.');
		return reply.status(400).send(resBody);
	}

	const players: GamesPlayer[] = prepareLocalPlayers(playerId, body.player2);

	// console.log('   ### Players created ###');

	const newGameId = createLocalPongSession(players);
	// console.log(` *** Game Session ID Created: ${newGameId} *** `);


	// 4. Return Success Response
	// This matches the 'HttpSetupResponse' interface that frontend expects
	const resBody: HttpSetupResponse = createHttpSuccessResponseBody(newGameId, 'left', 'local');
	// console.log(" ## Sending response ... ##");
	return reply.status(200).send(resBody);
}

function RemoteMode(playerId: string, body: HttpPongSetupReq, reply: FastifyReply) {

	/**
    	* add player:
	 		- Adds a player to the queue.

		* match making:
     		- Checks if we have 2 players.
     		- If yes, creates a session and returns it.
     		- If no, returns null (meaning "please wait").
     */

	// console.log(" ## Remote Mode ###");

    // 1. Get the current player context (already initialized in 'pongRoutesManager')
    const player: GamesPlayer = getPlayer(playerId);
    if (!player || !player.pongPlayer) {
         return reply.status(500).send(createHttpErrorResponseBody('Player context not initialized correctly.'));
    }

	// 2. add player to remote waiting room 
	pongGameSessionsRoom.addToWaitingRoom(player);

	// 3. match making
	const matchSessionId: string | null = pongGameSessionsRoom.matchMaking(player);

	// 4. match result
	// --- CASE A: MATCH FOUND (I am Player 2) ---
    if (matchSessionId) {
        // console.log("✅ Match made immediately!");

		// send success message: the pair players found & the remote game session created

		//  ==> A. send WS Message to player 1 (left)
		// Send WS Message to both players (it's important to send it to the player 1 who's already waiting. (not important) also to the player 2 who's the current player)
		
		const session = pongGameSessionsRoom.getSession(matchSessionId);
		if (session) {
            const wsMessage = pongEngine.createWSMatchIsReadyMessage(matchSessionId);
            // sendWSMsg(wsMessage, session);

			// send WS msg only to player 1
			const player1: GamesPlayer = getPlayer(session.players[0].playerId);
			const ws1: WebSocket | null = player1.ws as WebSocket | null;
			ws1!.send(JSON.stringify(wsMessage));
        }
		
		//  ==> B. send HTTP Message to player 2 (ritgh)
		const resBody: HttpSetupResponse = createHttpSuccessResponseBody(matchSessionId, 'right', 'remote');
        return reply.status(200).send(resBody);
	}

	// --- CASE B: QUEUED (I am Player 1) ---
	else {
        // console.log("⏳ Added to queue. Waiting for opponent...");

		// We return a specialized "Queued" status, NOT success yet || send empty session id means no session made yet
		const resBody: HttpSetupResponse = createHttpSuccessResponseBody('', 'left', 'remote');
		return reply.status(200).send(resBody);
		// return reply.status(200).send({
        //     status: 'queued', // custom status
        //     message: 'Added to matchmaking queue'
        // });

	}

	// // 2. MATCHMAKING LOGIC:
    // // looking if there is any session waiting for a player!!!
    // const availableSessionId = pongGameSessionsRoom.findWaitingSession();

	// let gameSessionId: string;
    // let finalSide: Side;

	// if (availableSessionId) {
	// 	// --- CASE A: JOIN EXISTING GAME (You are Player 2) ---
    //     console.log(`   >>> Found waiting game: ${availableSessionId}. Joining...`);

	// 	// 1. Update side to RIGHT (the player 2 is always in the right side)
    //     player.pongPlayer.side = 'right';
    //     finalSide = 'right';

	// 	// 2. Join the session
    //     gameSessionId = pongGameSessionsRoom.joinRemoteSession(availableSessionId, player.pongPlayer);

	// 	// 3. Update Player State
	// 	player.playerState = 'READY';
	// } else {
    //     // --- CASE B: CREATE NEW GAME (You are Player 1) ---
	// 	console.log("   >>> No waiting game found. Creating new session...");

	// 	// 1. Side remains LEFT
    //     finalSide = 'left';

	// 	// 2. Create new remote session (Wait for P2)
    //     gameSessionId = pongGameSessionsRoom.createRemoteSession(player.pongPlayer);

	// 	// 3. Update Player State
    //     player.playerState = 'WAITING_MATCH';
	// }

	// 3. Return Success Response
    // const resBody: HttpSetupResponse = createHttpSuccessResponseBody(gameSessionId, finalSide, 'remote');
    // return reply.status(200).send(resBody);


	// return reply.status(200).send({ 
	// 	status: 'success', 
	// 	message: 'Remote Invite processed (Stub)' 
	// });
}

function pongRoutesManager(req: FastifyRequest, reply:FastifyReply) {
	try {
		
		// showOnlinePlayers();

		// 1. Get the token from the cookie
        const token: string | undefined = req.cookies.accessToken;
		// console.log(" ==> token: ", token);

		if (!token) {
            return reply.status(401).send({ error: "Authentication required" });
        }

		// 2. Verify the token (Security Check)
        // This ensures the token was signed by your server and hasn't been tampered with.
        const decoded = req.server.jwt.verify(token) as { sub: string };

		// 3. Extract the Secure Player ID
        const playerId = decoded.sub;

		// player id
		// const playerId: string = req.cookies.playerId as string;
		// console.log(`  ==> Player Id: ${playerId} <==`);
		if (!playerId) {
			const resBody: HttpSetupResponse = createHttpErrorResponseBody('Unauthorized: Missing Player ID cookie.');
            return reply.status(401).send(resBody);
        }
		// console.log(" Basic validation ");
		
		// make sure is player exist
		if (!isPlayerExist(playerId)) {
			// console.log(" ## Player not Exist ##");
			return reply.status(404).send(createHttpErrorResponseBody('Player not found in active session. Please Re-login.'));
		}
		
		// 1. Cast the body to our expected type
		const body = req.body as HttpPongSetupReq;
		
		// console.log(`📩 [SERVER] Received Setup Request:`, body);

		// 2. basic Validation
		if (!body.player1 || !body.gameMode) {
			const resBody: HttpSetupResponse = createHttpErrorResponseBody('Bad Request: Missing player name or game mode.');
			return reply.status(400).send(resBody);
		}

		// ---- initialize selected game ----
		// console.log(" ===>   INIT SELECTED GAME  <====");
		initializePlayerGameContext(playerId, body.playerName, body.game);	

		// --- HANDLE LOCAL MODE ---

		if (body.gameMode === 'local') {
			localMode(playerId, body, reply);
		}

		// --- HANDLE REMOTE MODE (Future Implementation) ---
		else if (body.gameMode === 'remote') {
			RemoteMode(playerId, body, reply);
		}

		// Invalid Mode
		else {
			const resBody: HttpSetupResponse = createHttpErrorResponseBody('Invalid Game Mode received.');
			return reply.status(400).send(resBody);
		}

	} catch (error) {
		console.error("❌ [SERVER ERROR]", error);
		const resBody: HttpSetupResponse = createHttpErrorResponseBody('Internal Server Error');
		return reply.status(500).send(resBody);
	}
}

export { pongRoutesManager };