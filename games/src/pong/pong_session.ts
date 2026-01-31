
import { PongPlayer } from "./pong_types";
// import { createPongPlayer } from './pong_utils';
import { GamesPlayer } from '../game_manager/games_types';
import { getPlayer, addToPlayingPlayersRoom } from '../game_manager/games_utiles';
import { AvailableGames, HttpPongSetupReq } from '../../../shared/types';
import { pongGameSessionsRoom } from './pong_memory';

function createLocalPongSession(players: GamesPlayer[]): string {

	const player1: PongPlayer = players[0].pongPlayer!;
	const player2: PongPlayer = players[1].pongPlayer!;

	const sessionId: string = pongGameSessionsRoom.createSession(player1, player2, 'local');
	player1.sessiondId = sessionId;
	player2.sessiondId = sessionId;


	// set state of player object belongs to the client
	addToPlayingPlayersRoom(players[0].playerId);
	players[0].playerState = 'READY';

	console.log(`  prepare players || P1: ${players[0].playerName} || P2: ${players[1].playerName}`)

	return sessionId;
}

export { createLocalPongSession };