
import { GameState } from '../game_manager/gamesTypes';

// export type GameState = 'waiting' | 'playing' | 'finished';
export type GameMode = 'local' | 'remote';
export type PlayMode = 'friend' | 'random';
export type Side = 'right' | 'left'
export type PlayerState =
    'INIT'                 // Player created, nothing chosen yet
  | 'GAME_MODE_SELECTED'   // local / remote chosen
  | 'PLAY_MODE_SELECTED'   // friend / random chosen
  | 'FRIEND_NAME_SELECTED' // friend name entered
  | 'WAITING_MATCH'        // waiting for opponent (remote)
  | 'READY'                // fully configured
  | 'PLAYING'              // game loop running
  | 'FINISHED';            // game ended

  
// export enum GameMessageTypes {
// 	CONNECT = 'CONNECT',             // client → server: request connection
// 	MOVE = 'MOVE',                   // client → server: paddle movement
// 	CONNECTION_SUCCESS = 'CONNECTION_SUCCESS', // server → client: connection accepted
// 	CONNECTION_FAILED = 'CONNECTION_FAILED',   // server → client: connection rejected
// 	CLOSE = "CLOSE"
// }

// export type WsMessageType =
//     GameMessageTypes.CONNECT
//   | GameMessageTypes.CONNECTION_SUCCESS
//   | GameMessageTypes.CONNECTION_FAILED
//   | GameMessageTypes.MOVE
//   | GameMessageTypes.CLOSE;

export interface Ball {
	x: number;				// Current x position of the ball on the game board.
	y: number;				// Current y position of the ball on the game board.
	
	// ball_speed: number;	// ball speed
	velocityX: number;		// speed in the horizontal direction (left/right).
	velocityY: number;		// speed in the vertical direction (up/down).

	radius: number;			// Size of the ball.
}
  
export interface Paddle {
	// playerId: string; // Identifies which player this paddle belongs to. // // no needed
	x: number; // Horizontal position of the paddle on the game board. In classic Pong, paddles usually don’t move horizontally, but we still store it
	y: number; // Vertical position of the paddle (up/down).
	width: number; // Paddle width (horizontal size).
	height: number; // Paddle height (vertical size)
}

export interface PlayerInput { // represent player input.
	up: boolean;
	down: boolean;
}
  
export interface PongPlayer {

	id?: string;							// unique identifier for this player
	name: string;						// player name
	playerState: PlayerState;			// player state

	gameMode?: GameMode;				// local/remote
	playMode?: PlayMode					// friend/remote

	friendName?: string 				// friend name if chose play mode: friend

	// ws: WebSocket;      				// reference to the WebSocket connection // not needed yet
	// alias?: string;     				// player's display name. If the player sets a custom name // not needed yet
	// paddleY: number;    				// vertical position of the paddle
	
	paddle?: Paddle; 					// updated
	score?: number;
	input?: PlayerInput; // up/down
	side?: Side;

	pongSessionId?: string;

	// '?': makes a property optional, may exist or may not on the object
}

interface PongSession {
	// A GameSession is one running match of Pong between two players.
	// server creates one gameSession for each match.
	// the session will be destroyed after the match ends.

	createdAt: number;        // creating time
	
	state: GameState;		// ('waiting' | 'playing' | 'finished')
	gameMode?: GameMode;		// (local | remote)
	sessionId?: string;		// identifies this match
	players: PongPlayer[];		// exactly 2 Player objects (1 per player)
	ball: Ball;				// shared ball objetc instance
}

///// ----------------- Client Side ---------------------

type State = 'waiting' | 'playing' | 'paused' | 'finished';
type Winner = 'player1' | 'player2' | 'none';

interface LocalPongSession {
	sessionId: string;
    state: State;
  
    paddle1: {
    	x: number;
    	y: number;
    };
  
    paddle2: {
    	x: number;
    	y: number;
    };
  
    ball: {
    	x: number;
    	y: number;
    };
  
    score1: number;
    score2: number;

	winner: Winner;
	finaleScore1: number;
	finaleScore2: number;

	// *1: for player1 "Client"
	// *2: for player2 "Friend"

}

interface PongConstants {
	// World rules
	CANVAS_WIDTH: number,
	CANVAS_HEIGHT: number,

	// Paddle rules
	PADDLE_WIDTH: number,
	PADDLE_HEIGHT: number,

	// Ball rules
	BALL_RADIUS: number
}


interface PongGameConfig {
	PongConstants: PongConstants,
	sessionId: string;
	canvas?: HTMLCanvasElement;
	player1: string;
	player2: string;
}

export  { PongGameConfig, PongConstants, PongSession, LocalPongSession };