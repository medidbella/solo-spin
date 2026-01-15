
// import { GameState } from '../game_manager/gamesTypes';
import { GameMode, PlayMode, GameState } from '../../../shared/types';
import { createBall } from './pong_utils';

// export type GameState = 'waiting' | 'playing' | 'finished';
// export type GameMode = 'local' | 'remote';
// export type PlayMode = 'friend' | 'random';
export type Side = 'right' | 'left'
export type PongPlayerState =
    'INIT'                 // Player created, nothing chosen yet
//   | 'GAME_MODE_SELECTED'   // local / remote chosen
//   | 'PLAY_MODE_SELECTED'   // friend / random chosen
//   | 'FRIEND_NAME_SELECTED' // friend name entered
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

	// id: string;						// unique identifier for this player
	// name: string;						// player name
	// playerState: PlayerState;			// player state

	// gameMode: GameMode;				// local/remote
	// playMode: PlayMode					// friend/remote

	// friendName?: string 				// friend name if chose play mode: friend

	// ws: WebSocket;      				// reference to the WebSocket connection // not needed yet
	// alias?: string;     				// player's display name. If the player sets a custom name // not needed yet
	// paddleY: number;    				// vertical position of the paddle
	
	side: Side;
	paddle: Paddle; 					// updated
	score: number;
	input: PlayerInput; // up/down

	// pongSessionId?: string;

	// '?': makes a property optional, may exist or may not on the object
}

// interface PongSession {
// 	// A GameSession is one running match of Pong between two players.
// 	// server creates one gameSession for each match.
// 	// the session will be destroyed after the match ends.

// 	createdAt: number;        // creating time
	
// 	state: GameState;		// ('waiting' | 'playing' | 'finished')
// 	gameMode: GameMode | null;		// (local | remote)
// 	sessionId: string | null;		// identifies this match
// 	players: PongPlayer[];		// exactly 2 Player objects (1 per player)
// 	ball: Ball;				// shared ball objetc instance
// }

// ----------- Pong Game Session ------------------------

// import { v4 as uuidv4 } from 'uuid'; // Assuming you use uuid for unique IDs
import { randomUUID } from 'crypto';

export class PongSession {
    // --- Properties ---
    public createdAt: number;
    public state: GameState;
    public gameMode: GameMode;
    public playMode: PlayMode; // Added this as per your requirement
    public sessionId: string;
    public players: PongPlayer[];
    public ball: Ball;

    // --- Constructor ---
    // Sets up the initial state, timestamp, mode, players, and ball.
    constructor(
        gameMode: GameMode,
        playMode: PlayMode,
        players: PongPlayer[]
    ) {
        this.createdAt = Date.now();
        this.state = 'waiting'; // Default start state
        this.gameMode = gameMode;
        this.playMode = playMode;
        this.players = players;
		// players: createPongSessionPlayers();

        
        // Generate a unique ID immediately upon creation
        this.sessionId = this.generateSessionId();

        // Initialize the shared ball instance (assuming default center position)
        this.ball = createBall();
    }

    // --- Core Methods ---

    /**
     * Generates a unique string ID for this specific match.
     * Used as the key in the session Maps.
     */
    private generateSessionId(): string {
        return `pong_${Date.now()}_${randomUUID()}`;
    }

    // /**
    //  * Moves players from 'Available' to 'Playing' maps and 
    //  * registers this session in the correct (Local/Remote) Game Room.
    //  * * @param availablePlayersRoom - Global map of idle players
    //  * @param playingPlayersRoom - Global map of busy players
    //  * @param localPongGamesRoom - Global map for local sessions
    //  * @param remotePongGamesRoom - Global map for remote sessions
    //  */
    public registerGame(): void {
        // Implementation steps:
        // 1. Loop through this.players.
        // 2. For each player, .delete() them from availablePlayersRoom.
        // 3. .set() them into playingPlayersRoom.
        // 4. Check this.gameMode.
        // 5. If 'local', .set(this.sessionId, this) into localPongGamesRoom.
        // 6. If 'remote', .set(this.sessionId, this) into remotePongGamesRoom.
    }

    /**
     * Starts the game loop or logic.
     * Transitions state from 'waiting' to 'playing'.
     */
    public startGame(): void {
        // Implementation: Set this.state = 'playing', start timers/intervals.
    }

    /**
     * Cleans up the session when the match ends.
     * Should reverse the logic of registerGame (move players back to available).
     */
    public endGame(): void {
        // Implementation: Set this.state = 'finished', clear intervals, move players back.
    }
}

// ------------------------------------------------------

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
	// *2: for player2 "Friend/random"

}

// interface PongConstants {
// 	// World rules
// 	CANVAS_WIDTH: number,
// 	CANVAS_HEIGHT: number,

// 	// Paddle rules
// 	PADDLE_WIDTH: number,
// 	PADDLE_HEIGHT: number,

// 	// Ball rules
// 	BALL_RADIUS: number
// }


// interface PongGameConfig {
// 	PongConstants: PongConstants,
// 	sessionId: string;
// 	canvas?: HTMLCanvasElement;
// 	player1: string;
// 	player2: string;
// }

export  {
	// PongGameConfig, 
	// PongConstants,
	// PongSession,
	LocalPongSession };