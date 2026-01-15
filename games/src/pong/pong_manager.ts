
import { PongPlayer } from "./pong_types";
import { createPongPlayer } from './pong_utils';
import { GamesPlayer } from '../game_manager/games_types';
import { getPlayer } from '../game_manager/games_utiles';
import { AvailableGames, HttpPongSetupReq } from '../../../shared/types';

function createLocalPongSession(playerId: string, game: AvailableGames): string {

	// set games player obeject
	const p1: GamesPlayer = getPlayer(playerId)
	p1.game = game;
	
	// A. Create Pong Player Objects
	// (Assuming PongPlayer class takes a name and a side/ID)
	// const p1 = new PongPlayer(player1Name, 'left'); 
	// const p2 = new PongPlayer(player2Name, 'right'); // Local friend

	// const p1 = createPongPlayer(sessionData.gameMode)
	// const p2 =

	// B. Create the Game Session
	// (Using the class we defined earlier)
	const newSession = new PongSession('local', 'regular', [p1, p2]);

	// C. Register the Game
	// Move players to "playing" maps and save the session to the "local" room
	// Note: You need to import your global maps (availablePlayersRoom, etc.) here
	newSession.registerGame(
		availablePlayersRoom,
		playingPlayersRoom,
		localPongGamesRoom,
		remotePongGamesRoom
	);

	// D. Return the ID so the controller can send it to the frontend
	return newSession.sessionId;
}

export { createLocalPongSession };