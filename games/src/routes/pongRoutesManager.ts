
import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";

import { HttpPongSetupReq, HttpSetupResponse } from '../../../shared/types';
import { createHttpSuccessResponseBody, createHttpErrorResponseBody } from '../pong/pong_utils';

import { createLocalPongSession } from '../pong/pong_manager';
import { initializePlayerGameContext, prepareLocalPlayers } from '../game_manager/games_utiles';

import { AvailableGames, GamesPlayer } from "../game_manager/games_types";

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

	/* 3. set up pong game
		* create pong player object for the client(player1).
		* invite remote player if remote mode
		* create the pong player object for the concurrent(player2).
		* Create Game Session (Simulation) !!!!
	*/
	// const p1: GamesPlayer = getPlayer(playerId);
	// p1.concurrenName = body.player2;
	// const p2: createPongPlayer
	const players: GamesPlayer[] = prepareLocalPlayers(playerId, body.player2);

	console.log('   ### Players created ###');
	console.log("=========================================");
	console.log(players[0]);
	console.log("=========================================");
	console.log(players[1]);
	console.log("=========================================");

	// const newGameId = createLocalPongSession(playerId, body.game);


	// 4. Return Success Response
	// This matches the 'HttpSetupResponse' interface that frontend expects
	const resBody: HttpSetupResponse = createHttpSuccessResponseBody('temp-ID')
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


		// !!! need to check if the client is exist here!!! instead of !!

		// player id
		const playerId: string = req.cookies.playerId as string;
		if (!playerId) {
            const resBody: HttpSetupResponse = createHttpErrorResponseBody('Unauthorized: Missing Player ID cookie.');
            return reply.status(401).send(resBody);
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
		if (!initializePlayerGameContext(playerId, body.game))
			return reply.status(404).send(createHttpErrorResponseBody('Player not found in active session. Please Re-login.'));
		

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