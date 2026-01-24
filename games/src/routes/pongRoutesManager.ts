
import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";

import { HttpPongSetupReq, HttpSetupResponse } from '../../../shared/types';
import { createHttpSuccessResponseBody, createHttpErrorResponseBody } from '../pong/pong_utils';

import { createLocalPongSession } from '../pong/pong_session';
import { initializePlayerGameContext, prepareLocalPlayers } from '../game_manager/games_utiles';

import { AvailableGames, GamesPlayer } from "../game_manager/games_types";
import { isPlayerExist, showOnlinePlayers } from '../game_manager/games_utiles';

function localMode(playerId: string, body: HttpPongSetupReq, reply: FastifyReply) {
	
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
	const resBody: HttpSetupResponse = createHttpSuccessResponseBody(newGameId, 'left');
	// console.log(" ## Sending response ... ##");
	return reply.status(200).send(resBody);
}

function RemoteMode(body: HttpPongSetupReq, reply: FastifyReply) {
	return reply.status(200).send({ 
		status: 'success', 
		message: 'Remote Invite processed (Stub)' 
	});
}

function pongRoutesManager(req: FastifyRequest, reply:FastifyReply) {
	try {
		
		// showOnlinePlayers();

		// player id
		const playerId: string = req.cookies.playerId as string;
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
		
		console.log(`📩 [SERVER] Received Setup Request:`, body);

		// 2. basic Validation
		if (!body.player1 || !body.gameMode) {
			const resBody: HttpSetupResponse = createHttpErrorResponseBody('Bad Request: Missing player name or game mode.');
			return reply.status(400).send(resBody);
		}

		// ---- initialize selected game ----
		initializePlayerGameContext(playerId, body.game);	

		// --- HANDLE LOCAL MODE ---

		if (body.gameMode === 'local') {
			localMode(playerId, body, reply);
		}

		// --- HANDLE REMOTE MODE (Future Implementation) ---
		else if (body.gameMode === 'remote') {
			RemoteMode(body, reply);
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