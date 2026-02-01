
import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';

import { onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom } from './games_memory';
import { GamesPlayer, AvailableGames } from './games_types';

import { PongPlayer, PongPlayerState, PongSession } from '../pong/pong_types';
import { createPongPlayer } from '../pong/pong_utils';
import { SudokuPlayer } from '../sudoku/sudoku_types';
import { Breaker, GameMode } from '../../../shared/types';
import { pongGameSessionsRoom } from '../pong/pong_memory';
import { breakPongGame } from '../ws/ws_handler';

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
		playerState: 'IDLE',
		concurrentId: null,
		game: 'not_selected',
		pongPlayer: null,
		sudokuPlayer: null,
		ws: socket,
		isWsAlive: true
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

function getBreaker(session: PongSession, playerId: string): Breaker {
	return (session.players[0].playerId) ? 'p1' : 'p2';
}

function resetPlayerStatesIfAlreadyExist(playerId: string) {

	// console.log("   ==> reset already exist player <===");
	
	const player: GamesPlayer = getPlayer(playerId);
	const state: PongPlayerState = player.playerState;
	
	if (player.playerState === 'IDLE') {
		// console.log("  ==> player is not playing <==");
		return;
	} else {

		if (!player.pongPlayer || !player.pongPlayer.sessiondId)
			return ;

		const playerSession: PongSession | undefined = pongGameSessionsRoom.getSession(player.pongPlayer.sessiondId)
		if (!playerSession)
			return ;

		// console.log("  ==> player Is Playing <==");

		const gameMode: GameMode | null = playerSession.gameMode;
		if (gameMode === 'local') {
			// console.log("  **** Local Case ******");
			pongGameSessionsRoom.endGame(playerSession.sessionId, gameMode);

		} else if (gameMode === 'remote') {
			// console.log("  **** Remote Case ******");
			playerSession.breaker = getBreaker(playerSession, playerId);
			breakPongGame(playerId, null, playerSession, 'BREAK');
		}
	}


	// if (player && player.pongPlayer && player.pongPlayer.sessiondId) {
	// 	const playerSession: PongSession | undefined = pongGameSessionsRoom.getSession(player.pongPlayer.sessiondId)
	// 	if (playerSession) {
	// 		const gameMode: GameMode | null = playerSession.gameMode;
	// 		if (gameMode === 'local') {
	// 			console.log("  **** Local Case ******");
	// 			pongGameSessionsRoom.endGame(playerSession.sessionId, gameMode);

	// 		} else if (gameMode === 'remote') {
	// 			console.log("  **** Remote Case ******");
	// 		}	
	// 	}
	// }
	// else {
	// 	player.playerState = 'IDLE';
	// 	player.concurrentId = null;
	// 	player.game = 'not_selected';
	// 	player.pongPlayer = null;
	// 	player.sudokuPlayer = null;
	// }



	// addToAvailablePlayersRoom(playerId);
}

function registerNewPlayer(playerId: string, playerName: string, socket: WebSocket): void {
	if (isPlayerExist(playerId)) {
		// console.log("  =>> the player is already exist <<=");
		// resetPlayerStatesIfAlreadyExist(playerId);
		return ; // already exist
	}

	const newPlayer: GamesPlayer = createNewPlayer(playerId, playerName, socket);
	addToOnlinePlayersRoom(newPlayer);
	addToAvailablePlayersRoom(playerId);
}

function resetPlayers(player1Id: string, player2Id: string, gameMode: GameMode) {
	const player1: GamesPlayer = getPlayer(player1Id);
	let player2: GamesPlayer; 
	if (gameMode === 'remote')
		player2 = getPlayer(player2Id);
	else
		player2 = playingPlayersRoom.get(player2Id)!;

	if (player1) {
		player1.playerState = 'IDLE';
		player1.concurrentId = null;
		player1.game = 'not_selected';
		player1.pongPlayer = null;
		player1.sudokuPlayer = null;

		// console.log("  ==>> Resetde player 1 <<==");
		addToAvailablePlayersRoom(player1.playerId);
	}


	if (gameMode === 'local') {
		// console.log(`  ===>>> player2Id: ${player2Id}  <<=========`);
		// console.log(`  ===>>> player2.playerId: ${player2.playerId}  <<=========`);
		playingPlayersRoom.delete(player2.playerId);

	}
	else {
		if (player2) {
			player2.playerState = 'IDLE';
			player2.concurrentId = null;
			player2.game = 'not_selected';
			player2.pongPlayer = null;
			player2.sudokuPlayer = null;

			// console.log("  ==>> Resetde player 2 <<==");
			addToAvailablePlayersRoom(player2.playerId);
		}
	}
}


function initializePlayerGameContext(playerId: string, playerName: string, gameType: AvailableGames) {

	const player: GamesPlayer = getPlayer(playerId);

    // 1. Set the game type (Pong or Sudoku) and the name
	// console.log(` ====>>>>  Setting the name : ${playerName}  <<<<====`);
	player.playerName = playerName;
    player.game = gameType;
	// console.log(`  game:  ${gameType}  `);

    // 2. Instantiate the specific game object based on type
    if (gameType === 'pong') {
        // Create the PongPlayer instance (assuming it needs name & side)
        player.pongPlayer = createPongPlayer(playerId, 'left');
        player.sudokuPlayer = null; // Ensure other games are null
		// console.log("   ## Create pong player1",  player);

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
	p1.playerId = player1Id;

	// create temp local player
	const p2: GamesPlayer = createNewPlayer(player2Id, player2Name, null);
	p2.concurrentId = player1Id
	p2.game = 'pong';
	p2.playerId = player2Id;
	p2.pongPlayer = createPongPlayer(player2Id, 'right');
	p2.pongPlayer.playerId = player2Id;
	// console.log(` **** set Id for player2: ${p2.pongPlayer.playerId} ****`);

	// add the local player to the playing room
	playingPlayersRoom.set(player2Id, p2);

	return [p1, p2];

}

export { addToPlayingPlayersRoom, registerNewPlayer, isPlayerExist,
		showOnlinePlayers, getPlayer, initializePlayerGameContext,
		prepareLocalPlayers, resetPlayers, resetPlayerStatesIfAlreadyExist };
