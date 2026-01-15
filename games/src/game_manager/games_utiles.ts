
import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';

import { onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom } from './games_memory';
import { GamesPlayer, AvailableGames } from './games_types';

import { PongPlayer } from '../pong/pong_types';
import { createPongPlayer } from '../pong/pong_utils';
import { SudokuPlayer } from '../sudoku/sudoku_types';

function getPlayer(playerId: string): GamesPlayer {
	return onlinePlayersRooom.get(playerId) as GamesPlayer;
}

function isPlayerExist(playerId: string): Boolean {
	return onlinePlayersRooom.has(playerId);
}

function createNewPlayer(playerId: string, playerName: string, socket: WebSocket | null) {
	const newPlayer: GamesPlayer = {
		playerId,
		playerName,
		playerState: 'INIT',
		concurrentId: null,
		game: 'not_selected',
		pongPlayer: null,
		sudokuPlayer: null,
		ws: socket
	}
	return newPlayer;
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

function registerNewPlayer(playerId: string, playerName: string, socket: WebSocket): void {
	if (isPlayerExist(playerId))
		return ; // already exist

	createNewPlayer(playerId, playerName, socket);
	addToAvailablePlayersRoom(playerId);
}


function initializePlayerGameContext(playerId: string, gameType: AvailableGames): Boolean {

	console.log(" ====>>> initializePlayerGameContext");

	const player: GamesPlayer = getPlayer(playerId);
	
	// SAFETY CHECK: If server restarted or ID is invalid, player is undefined
    if (!player) {
		return false;
    }

    // 1. Set the game type (Pong or Sudoku)
    player.game = gameType;

    // 2. Instantiate the specific game object based on type
    if (gameType === 'pong') {
        // Create the PongPlayer instance (assuming it needs name & side)
        player.pongPlayer = createPongPlayer('left');
        player.sudokuPlayer = null; // Ensure other games are null

		player.playerState = 'WAITING_MATCH';
    } 
    else if (gameType === 'sudoku') {
        // player.sudokuPlayer = new SudokuPlayer(player.playerName);
        player.sudokuPlayer = null; // not yet
        player.pongPlayer = null;
    }
	return true;
}

function prepareLocalPlayers(player1Id: string, player2Name: string): GamesPlayer[] {
	
	const player2Id: string = `${player2Name}_${randomUUID()}`;
	
	const p1: GamesPlayer = getPlayer(player1Id);
	p1.concurrentId = player2Id;

	const p2: GamesPlayer = createNewPlayer(player2Id, player2Name, null);
	p2.concurrentId = player1Id

	return [p1, p2];

}

export { registerNewPlayer, getPlayer, initializePlayerGameContext, prepareLocalPlayers };