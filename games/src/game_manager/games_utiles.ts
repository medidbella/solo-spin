
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

function showOnlinePlayers(): void {
	console.log(" =========== Online players ==============\n");
	onlinePlayersRooom.forEach((value: GamesPlayer, key: string) => {
		console.log(" -------------------------------");
		console.log(`ID: ${key}, Name: ${onlinePlayersRooom.get(key)?.playerName}`);
	});
	console.log("\n======================================");
}

function createNewPlayer(playerId: string, playerName: string, socket: WebSocket | null): GamesPlayer {
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

function addToOnlinePlayersRoom(newPlayer: GamesPlayer) {
	onlinePlayersRooom.set(newPlayer.playerId, newPlayer);
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

	const newPlayer: GamesPlayer = createNewPlayer(playerId, playerName, socket);
	addToOnlinePlayersRoom(newPlayer);
	addToAvailablePlayersRoom(playerId);
}


function initializePlayerGameContext(playerId: string, gameType: AvailableGames) {

	const player: GamesPlayer = getPlayer(playerId);

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
}

function prepareLocalPlayers(player1Id: string, player2Name: string): GamesPlayer[] {
	
	const player2Id: string = `${player2Name}_${randomUUID()}`;
	
	const p1: GamesPlayer = getPlayer(player1Id);
	p1.concurrentId = player2Id;

	const p2: GamesPlayer = createNewPlayer(player2Id, player2Name, null);
	p2.concurrentId = player1Id
	p2.game = 'pong';

	return [p1, p2];

}

export { addToPlayingPlayersRoom, registerNewPlayer, isPlayerExist, showOnlinePlayers, getPlayer, initializePlayerGameContext, prepareLocalPlayers };