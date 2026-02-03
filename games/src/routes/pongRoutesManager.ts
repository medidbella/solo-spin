
import { FastifyRequest, FastifyReply } from "fastify";

import { HttpPongSetupReq, HttpSetupResponse } from '../../../shared/types';
import { createHttpSuccessResponseBody, createHttpErrorResponseBody } from '../pong/pong_utils';

import { createLocalPongSession } from '../pong/pong_session';
import { initializePlayerGameContext, prepareLocalPlayers } from '../game_manager/games_utiles';

import { GamesPlayer } from "../game_manager/games_types";
import { isPlayerExist, getPlayer } from '../game_manager/games_utiles';

import { pongEngine, pongGameSessionsRoom } from '../pong/pong_memory';

function localMode(playerId: string, body: HttpPongSetupReq, reply: FastifyReply) {
	
	if (!body.player2 || body.player2.trim() === "") {
		const resBody: HttpSetupResponse = createHttpErrorResponseBody('Local mode requires a name for Player 2.');
		return reply.status(400).send(resBody);
	}

	if (body.player1 === body.player2) {
		const resBody: HttpSetupResponse = createHttpErrorResponseBody('Players must have different names.');
		return reply.status(400).send(resBody);
	}

	const players: GamesPlayer[] = prepareLocalPlayers(playerId, body.player2);
	const newGameId = createLocalPongSession(players);
	const resBody: HttpSetupResponse = createHttpSuccessResponseBody(newGameId, 'left', 'local');
	return reply.status(200).send(resBody);
}

function RemoteMode(playerId: string, body: HttpPongSetupReq, reply: FastifyReply) {

    const player: GamesPlayer = getPlayer(playerId);
    if (!player || !player.pongPlayer) {
         return reply.status(500).send(createHttpErrorResponseBody('Player context not initialized correctly.'));
    }

	pongGameSessionsRoom.addToWaitingRoom(player);

	const matchSessionId: string | null = pongGameSessionsRoom.matchMaking(player);

    if (matchSessionId) {
		const session = pongGameSessionsRoom.getSession(matchSessionId);
		if (session) {
            const wsMessage = pongEngine.createWSMatchIsReadyMessage(matchSessionId);
			const player1: GamesPlayer = getPlayer(session.players[0].playerId);
			const ws1: WebSocket | null = player1.ws as WebSocket | null;
			ws1!.send(JSON.stringify(wsMessage));
        }
		
		const resBody: HttpSetupResponse = createHttpSuccessResponseBody(matchSessionId, 'right', 'remote');
        return reply.status(200).send(resBody);
	}

	else {
		const resBody: HttpSetupResponse = createHttpSuccessResponseBody('', 'left', 'remote');
		return reply.status(200).send(resBody);

	}
}

function pongRoutesManager(req: FastifyRequest, reply:FastifyReply) {
	try {
        const token: string | undefined = req.cookies.accessToken;

		if (!token) {
            return reply.status(401).send({ error: "Authentication required" });
        }

        const decoded = req.server.jwt.verify(token) as { sub: string };
        const playerId = decoded.sub;
		if (!playerId) {
			const resBody: HttpSetupResponse = createHttpErrorResponseBody('Unauthorized: Missing Player ID cookie.');
            return reply.status(401).send(resBody);
        }

		if (!isPlayerExist(playerId)) 
			return reply.status(404).send(createHttpErrorResponseBody('Player not found in active session. Please Re-login.'));
		
		const body = req.body as HttpPongSetupReq;
	
		if (!body.player1 || !body.gameMode) {
			const resBody: HttpSetupResponse = createHttpErrorResponseBody('Bad Request: Missing player name or game mode.');
			return reply.status(400).send(resBody);
		}

		initializePlayerGameContext(playerId, body.playerName, body.game);	

		if (body.gameMode === 'local') {
			localMode(playerId, body, reply);
		}
		else if (body.gameMode === 'remote') {
			RemoteMode(playerId, body, reply);
		}
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