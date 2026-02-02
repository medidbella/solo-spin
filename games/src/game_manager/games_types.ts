

import { WebSocket } from 'ws';

import { PongPlayer, PongPlayerState } from '../pong/pong_types';

type AvailableGames = 'not_selected' | 'pong' | 'sudoku';

interface GamesPlayer {
	playerId: string,
	playerName: string;
	playerState: PongPlayerState;
	concurrentId: string | null;
	ws: WebSocket | null;
	isWsAlive: boolean;
	game: AvailableGames;
	pongPlayer: PongPlayer | null;
}

export {
	GamesPlayer,
	AvailableGames
};