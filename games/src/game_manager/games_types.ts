

import { WebSocket } from 'ws';

import { PongPlayer, PongPlayerState } from '../pong/pong_types';
import { SudokuPlayer } from '../sudoku/sudoku_types';

type AvailableGames = 'not_selected' | 'pong' | 'sudoku';
// type GameState = 'waiting' | 'playing' | 'finished';

// enum GameMessageTypes {
// 	CONNECT = 'CONNECT',             // client → server: request connection
// 	EVENT = 'EVENT',                   // client → server: event
// 	CONNECTION_SUCCESS = 'CONNECTION_SUCCESS', // server → client: connection accepted
// 	CONNECTION_FAILED = 'CONNECTION_FAILED',   // server → client: connection rejected
// 	CLOSE = "CLOSE"
// }

// type WsMessageType =
// 	GameMessageTypes.CONNECT
// 	| GameMessageTypes.CONNECTION_SUCCESS
// 	| GameMessageTypes.CONNECTION_FAILED
// 	| GameMessageTypes.EVENT
// 	| GameMessageTypes.CLOSE;

interface GamesPlayer {
    playerId: string,
    playerName: string;
    playerState: PongPlayerState;
    concurrentId: string | null; // for remote game
	ws: WebSocket | null; // null if create a local player for local game (use one socket cause two player playing in the same machine)
	
    game: AvailableGames;
	// pongSutUp: PongSutUp;
	// sudokuSetUp: SudokuSetUp;
	pongPlayer: PongPlayer | null;
	sudokuPlayer: SudokuPlayer | null;

	// pongPlayer2: PongPlayer | null; // for player 2 for local pong game
}


// type wsConnectionType = 'CONNECT' | 'CONNCET_FAILED' | 'CONNCET_SUCCESS' | 'GAME_EVENT'

// interface WSBaseMessage {
//     game: AvailableGames;
//     type: wsConnectionType;
// }

// type wsConnectionType = 'CONNECT' | 'CONNECT_RESULT' | 'GAME_EVENT'
// type AvailableGames = 'pong' | 'sudoku';
// type PongGameMove = 'up' | 'down';


// export interface WSBaseMessage {
//     type: wsConnectionType;          // message kind
// }

// // Client → Server
// export interface WSConnectMessage extends WSBaseMessage {
//     type: wsConnectionType; // 'CONNECT'
//     target: AvailableGames;
// }

// // Server → Client response
// export interface WSConnectResponse extends WSBaseMessage {
//     type: wsConnectionType; // 'CONNECT_RESULT'
//     success: boolean;
//     reason?: string;
// }

// // Client → Server game events (pong/sudoku)
// export interface WSGameEvent {
//     type: wsConnectionType; // GAME_EVENT
//     game: AvailableGames; // 'pong' | 'sudoku'
// }

// // pong Client → Server (pong: move up/dowm | sudodu: put/remove number)
// export interface WSPongEvent {
//     type: wsConnectionType; // GAME_EVENT
//     game: AvailableGames; // 'pong' | 'sudoku'
//     move: PongGameMove;
// }

export {
    // GameState, GameMessageTypes, WsMessageType,
    GamesPlayer,
    AvailableGames
};