
import { onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom } from './game_memory';
import { GamesPlayer } from './games_types';

import { PongPlayer } from '../pong/pong_types';
import { SudokuPlayer } from '../sudoku/sudoku_types';

function getPlayer(playerId: string): GamesPlayer {
	return onlinePlayersRooom.get(playerId);
}

function isPlayerExist(playerId: string): Boolean {
	return onlinePlayersRooom.has(playerId);
}

function createNewPlayer(playerId: string, socket: WebSocket) {
	const newPlayer: GamesPlayer = {
		game: 'not_selected',
		pongPlayer: undefined,
		sudokuPlayer: undefined,
		ws: socket
	}
}

function addToAvailablePlayersRoom(playerId: string) {

	const player: GamesPlayer = getPlayer(playerId);

	playingPlayersRoom.delete(playerId);
	availablePlayersRoom.set(playerId, player);
}

function addToPlayingPlayersRoom(playerId: string) {
	const player: GamesPlayer = getPlayer(playerId);

	availablePlayersRoom.delete(playerId);
	playingPlayersRoom.set(playerId, player);
}

function setPongPlayer(playerId: string, pongPlayer: PongPlayer) {
	const player: GamesPlayer = getPlayer(playerId);

	player.game = 'pong';
	player.pongPlayer = pongPlayer;
}

function setSudokuPlayer(playerId: string, sudokuPlayer: SudokuPlayer) {
	const player: GamesPlayer = getPlayer(playerId);

	player.game = 'sudoku';
	player.sudokuPlayer = sudokuPlayer;
}

function registerNewPlayer(playerId: string, socket: WebSocket): void {
	if (isPlayerExist(playerId))
		return ; // already exist

	createNewPlayer(playerId, socket);
	addToAvailablePlayersRoom(playerId);
}

export { registerNewPlayer };