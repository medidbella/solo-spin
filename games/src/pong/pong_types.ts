
// import { GameState } from '../game_manager/gamesTypes';
import { GameMode, PlayMode, GameState, PongSessionData, Winner } from '../../../shared/types';
import { createBall } from './pong_utils';
import { pongEngine } from './pong_memory';
import { resetPlayer } from '../game_manager/games_utiles';
import { sendWSMsg } from '../ws/ws_handler';
import { GAME_STATE_UPDATE_INTERVAL_MS } from '../../../shared/pong_constants';

export type Side = 'right' | 'left'
export type PongPlayerState =
    'IDLE'                 // Player created, nothing chosen yet
  | 'WAITING_MATCH'        // waiting for opponent (remote)
  | 'READY'                // fully configured
  | 'PLAYING'              // game loop running
  | 'FINISHED';            // game ended

export interface Ball {
	x: number;				// Current x position of the ball on the game board.
	y: number;				// Current y position of the ball on the game board.
	
	// ball_speed: number;	// ball speed
	// velocityX: number;		// speed in the horizontal direction (left/right).
	// velocityY: number;		// speed in the vertical direction (up/down).

	speed: number; 
    dx: number;    
    dy: number;

	radius: number;			// Size of the ball.
}
  
export interface Paddle {
	// playerId: string; // Identifies which player this paddle belongs to. // // no needed
	x: number; // Horizontal position of the paddle on the game board. In classic Pong, paddles usually don’t move horizontally, but we still store it
	y: number; // Vertical position of the paddle (up/down).
	// width: number; // Paddle width (horizontal size).
	// height: number; // Paddle height (vertical size)
}

export interface PlayerInput { // represent player input.
	up: boolean;
	down: boolean;
}
  
export interface PongPlayer {

	playerId: string;						// unique identifier for this player
	
	side: Side;
	paddle: Paddle; 					// updated
	score: number;
	input: PlayerInput; // up/down

	// pongSessionId?: string;

	// '?': makes a property optional, may exist or may not on the object
}

interface PongSession {
	// A GameSession is one running match of Pong between two players.
	// server creates one gameSession for each match.
	// the session will be destroyed after the match ends.

	createdAt: number;        // creating time
	
	state: GameState;		// ('waiting' | 'playing' | 'finished')
	gameMode: GameMode;		// (local | remote)
	sessionId: string;		// identifies this match
	players: PongPlayer[];		// exactly 2 Player objects (1 per player)
	ball: Ball;				// shared ball objetc instance

	winner: Winner; // the id of the winnere player

	nextRoundStartTimestamp: number; // time to start the next round
}

// ----------- Pong Game Session ------------------------

// import { v4 as uuidv4 } from 'uuid'; // Assuming you use uuid for unique IDs
import { randomUUID } from 'crypto';

class PongSessionsRoom {

	// ------------ Properties -----------------------------
    // Maps sessionId -> PongSession object
    private localSessions = new Map<string, PongSession>();
    private remoteSessions = new Map<string, PongSession>();
	// ------------------------------------------------------

	// Singleton Instance:
	private static instance: PongSessionsRoom;
	private constructor() {
		// 2. Turn on the Engine (if it's not already on)
        this.startGlobalLoop();
	}

	public static getInstance(): PongSessionsRoom {
		if (!PongSessionsRoom.instance) {
			PongSessionsRoom.instance = new PongSessionsRoom();
		}
		return PongSessionsRoom.instance;
	}

    // --- Methods ---

    /**
     * 1. Register Session: - Creates a new session, generates an ID, 
     *                      - adds it to the map, and returns the ID.
     */
    public createSession(player1: PongPlayer, player2: PongPlayer, gameMode: GameMode): string {
        const newId = randomUUID();

        const newSession: PongSession = {
            sessionId: newId,
            createdAt: Date.now(),
            state: 'waiting',
            gameMode,
            players: [player1, player2],
            ball: createBall(),
			winner: 'none',
			nextRoundStartTimestamp: 0
        };

		if (gameMode === 'local')
	        this.localSessions.set(newId, newSession);
		else
			this.remoteSessions.set(newId, newSession);

        console.log(`[PongRoom] Session created: ${newId} | Mode: ${gameMode}`);

		console.log("pong player 2:", player2);
        
        return newId;
    }

    /**
     * Helper: Retrieve a session by ID.
     * Useful for the WebSocket connection to find which game the user is joining.
     */
    public getSession(sessionId: string): PongSession | undefined {
        // if (gameMode === 'local')
		// 	return this.localSessions.get(sessionId);
		// return this.remoteSessions.get(sessionId);

		let session: PongSession | undefined = this.localSessions.get(sessionId);
		if (!session)
			session = this.remoteSessions.get(sessionId);
		return session;
    }

    /**
     * 2. Remove Session: Deletes the session from memory.
     */
    public removeSession(sessionId: string, gameMode: GameMode): boolean {
		let deleted: boolean;
		if (gameMode === 'local')
        	deleted = this.localSessions.delete(sessionId);
		else
			deleted = this.remoteSessions.delete(sessionId);
        if (deleted) {
            console.log(`[PongRoom] Session removed: ${sessionId}`);
        }
        return deleted;
    }

	private startGlobalLoop(): void {
        console.log("[PongRoom] Global Game Loop Started!");

		// 2. The Heartbeat
        setInterval(() => {
			// Loop through ALL Local Sessions
            this.localSessions.forEach((session: PongSession, sessionId: string) => {
				// Only process games that are actually PLAYING
                if (session.state === 'playing') {
					// 3. Update Physics (Move Ball, Check Collisions)
                    const results: PongSessionData = pongEngine.gameTick(session);
					// console.log(" ---------------- Results -------------");
					// console.log(results);
					// console.log("---------------------------------------");
					// console.log("  Updating Physics ....");

					// (i am not sending results yet, just updating state in memory)
					// sending results later!!!!!
					sendWSMsg(results, session);
				}

			});

		},  GAME_STATE_UPDATE_INTERVAL_MS);

	}

    /**
     * 3. Start the game: Set state = 'playing'
     */
    public startGame(sessionId: string): void {
		let session: PongSession | undefined;
		// if (gameMode === 'local')
	    //     session = this.localSessions.get(sessionId);
        // else
		// 	session = this.remoteSessions.get(sessionId);
		// if (!session) {
        //     console.error(`[PongRoom] Cannot start: Session ${sessionId} not found.`);
        //     return;
        // }

		session = this.localSessions.get(sessionId);
		if (!session)
			session = this.remoteSessions.get(sessionId);
		if (!session) {
            console.error(`[PongRoom] Cannot start: Session ${sessionId} not found.`);
            return;
        }

		// 1. Mark as ready:
        session.state = 'playing';
        console.log(`[PongRoom] Game started: ${sessionId}`);
    }

    /**
     * 4. End the game: Set state = 'finished'
     * Optional: You might want to auto-remove it after a delay here.
     */
    public endGame(sessionId: string, gameMode: GameMode): void {
        let session: PongSession | undefined;

		// 1. Find the session
		if (gameMode === 'local')
	        session = this.localSessions.get(sessionId);
        else
			session = this.remoteSessions.get(sessionId);

		// 2. Safety Check
        if (!session) {
            console.error(`[PongRoom] Cannot end: Session ${sessionId} not found.`);
            return;
        }

        // 3. Mark as Finished 
        // (The Global Loop will see this and stop updating physics)
        session.state = 'finished';
        console.log(`[PongRoom] Game finished: ${sessionId}`);

		// 5. send the result to backend (database)
		// later...

		// 6. reset the players objects
		resetPlayer(session.players[0].playerId, session.players[1].playerId, session.gameMode);

		// 7. Schedule Cleanup
        // Wait 10 seconds to let clients read the score, then delete.
        setTimeout(() => {
            this.removeSession(sessionId, gameMode);
        }, 10000);
    }
}

export  {
	// PongGameConfig, 
	// PongConstants,
	PongSessionsRoom,
	PongSession,
	// LocalPongSession
};