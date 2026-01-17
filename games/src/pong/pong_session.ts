
import { PongPlayer } from "./pong_types";
// import { createPongPlayer } from './pong_utils';
import { GamesPlayer } from '../game_manager/games_types';
import { getPlayer, addToPlayingPlayersRoom } from '../game_manager/games_utiles';
import { AvailableGames, HttpPongSetupReq } from '../../../shared/types';
import { pongGameSessionsRoom } from './pong_memory';

function createLocalPongSession(players: GamesPlayer[]): string {

	const sessionId: string = pongGameSessionsRoom.createSession(players[0].pongPlayer!, players[1].pongPlayer!, 'local');

	// set state of player object belongs to the client
	addToPlayingPlayersRoom(players[0].playerId);
	players[0].playerState = 'READY';

	return sessionId;
}

export { createLocalPongSession };