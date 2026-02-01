
// import { GameState } from '../game_manager/gamesTypes';
import { GameMode, GameState, PongSessionData, Winner, Breaker } from '../../../shared/types';
import { createBall } from './pong_utils';
import { pongEngine } from './pong_memory';
import { resetPlayers } from '../game_manager/games_utiles';
import { sendWSMsg } from '../ws/ws_handler';
import { GAME_STATE_UPDATE_INTERVAL_MS, WINNING_SCORE, PINGTIMEOUT } from '../../../shared/pong_constants';
import { GamesPlayer } from '../game_manager/games_types';
import { addToPlayingPlayersRoom } from '../game_manager/games_utiles';
import { onlinePlayersRooom } from '../game_manager/games_memory';

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
	sessiondId: string | null;

	// pongSessionId?: string;

	// '?': makes a property optional, may exist or may not on the object
}

interface PongSession {
	// A GameSession is one running match of Pong between two players.
	// server creates one gameSession for each match.
	// the session will be destroyed after the match ends.

	createdAt: number;        // creating time

	timeOut:	number;
	playerStarted: number;
	
	state: GameState;		// ('waiting' | 'playing' | 'finished')
	gameMode: GameMode;		// (local | remote)
	sessionId: string;		// identifies this match
	players: PongPlayer[];		// exactly 2 Player objects (1 per player)
	ball: Ball;				// shared ball objetc instance

	winner: Winner; // the id of the winnere player
	breaker: Breaker;

	nextRoundStartTimestamp: number; // time to start the next round
}

interface GameResult {
	winner_id: string,
	loser_id: string,
	winner_score: number,
	loser_score: number
}

// ----------- Pong Game Session ------------------------

// import { v4 as uuidv4 } from 'uuid'; // Assuming you use uuid for unique IDs
import { randomUUID } from 'crypto';
import { Session } from 'inspector/promises';

class PongSessionsRoom {

	// ------------ Properties -----------------------------
    // Maps sessionId -> PongSession object
    private localSessions = new Map<string, PongSession>();
    private remoteSessions = new Map<string, PongSession>();
	private waitingPlayersQueue: GamesPlayer[] = [];

	// Properties to store the interval IDs
    private localSessionsTickInterval: NodeJS.Timeout | null = null;
    private remoteSessionsTickInterval: NodeJS.Timeout | null = null;
    private WsPingInterval: NodeJS.Timeout | null = null;
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
    public createSession(player1: PongPlayer, player2: PongPlayer | null, gameMode: GameMode): string {
        const newId = randomUUID();

		const players: PongPlayer[] = [player1];
		if (player2) {
			// console.log("   #### ==>> player 2 has been Added <<== #### ");
			players.push(player2);
		}
		// else
			// console.log("   #### ==>> player 2 Not Exist <<== #### ");

		// console.log(`   **** playes Size: ${players.length} *******`);

        const newSession: PongSession = {
            sessionId: newId,
            createdAt: Date.now(),
			timeOut: 0,
			playerStarted: 0,
            state: 'waiting',
            gameMode,
            players,
            ball: createBall(),
			winner: 'none',
			breaker: 'none',
			nextRoundStartTimestamp: 0
        };

		if (gameMode === 'local')
	        this.localSessions.set(newId, newSession);
		else
			this.remoteSessions.set(newId, newSession);

        // console.log(`[PongRoom] Session created: ${newId} | Mode: ${gameMode}`);

		// console.log("pong player 2:", player2);
        
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
            // console.log(`[PongRoom] Session removed: ${sessionId}`);
        }
        return deleted;
    }

	private startGlobalLoop(): void {
        // console.log("[PongRoom] Global Game Loop Started!");

		// 2. The Heartbeat
        this.localSessionsTickInterval = setInterval(() => {
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

		this.remoteSessionsTickInterval = setInterval(() => {
			// Loop through ALL Remote Sessions
			this.remoteSessions.forEach((session: PongSession, sessionId: string) => {
				if (session.state === 'playing') {
					// console.log("  ==> Here is a playing session <==");
					const results: PongSessionData = pongEngine.gameTick(session);
					sendWSMsg(results, session);
				}
			});

		}, GAME_STATE_UPDATE_INTERVAL_MS);

		this.WsPingInterval = setInterval(() => {
		
			onlinePlayersRooom.forEach((player: GamesPlayer, playerId: string) => {
				if (player.ws && player.isWsAlive === false) {
					
					// Kill it
					player.ws.removeAllListeners();
					player.ws.terminate();
					return
				}
	
				// Mark as false and wait for the 'pong' to set it back to true
				player.isWsAlive = false;
				if (player.ws)
					player.ws.ping();
			});
		
		}, PINGTIMEOUT);

	}

	public stopGlobalLoop(): void {
        console.log("[PongRoom] Stopping Global Game Loops...");

        // 1. Clear Local Game Loop
        if (this.localSessionsTickInterval) {
            clearInterval(this.localSessionsTickInterval);
            this.localSessionsTickInterval = null;
        }

        // 2. Clear Remote Game Loop
        if (this.remoteSessionsTickInterval) {
            clearInterval(this.remoteSessionsTickInterval);
            this.remoteSessionsTickInterval = null;
        }

        // 3. Clear Heartbeat (Ping) Interval
        if (this.WsPingInterval) {
            clearInterval(this.WsPingInterval);
            this.WsPingInterval = null;
        }

        console.log("[PongRoom] All loops stopped.");
    }

    /**
     * 3. Start the game: Set state = 'playing'
     */
    public startGame(sessionId: string): void {
		// let session: PongSession | undefined;
		// if (gameMode === 'local')
	    //     session = this.localSessions.get(sessionId);
        // else
		// 	session = this.remoteSessions.get(sessionId);
		// if (!session) {
        //     console.error(`[PongRoom] Cannot start: Session ${sessionId} not found.`);
        //     return;
        // }

		const session: PongSession | undefined = this.getSession(sessionId)

		// session = this.localSessions.get(sessionId);
		// if (!session)
		// 	session = this.remoteSessions.get(sessionId);
		if (!session) {
            // console.error(`[PongRoom] Cannot start: Session ${sessionId} not found.`);
            return;
        }

		if (session.gameMode == 'remote') {
			session.playerStarted++;

			// console.log(`   **************** Started Players: ${session.playerStarted} *********************** `)

			if (session.playerStarted != 2)
				return ;
		}

		// console.log(`   _____ Player 1 Side: ${session.players[0].side} __________`);
		// console.log(`   _____ Player 2 Side: ${session.players[1].side} __________`);

		// console.log("__________________Player 1________________");
		// console.log("player 1:", session.players[0]);
		// console.log("__________________Player 2________________");
		// console.log("player 2:", session.players[1]);
		// console.log("__________________________________________");

		// 1. Mark as ready:
        session.state = 'playing';
        // console.log(`[PongRoom] Game started: ${sessionId}`);
    }

    /**
     * 4. End the game: Set state = 'finished'
     * Optional: You might want to auto-remove it after a delay here.
     */

	private getJsonGameResult(session: PongSession): any {

		// console.log(`   >>>>>>>>>> Session ends with State: ${session.state} <<<<<<<<<<`);

		let gameResult: GameResult;
		const p1: PongPlayer = session.players[0];
		const p2: PongPlayer = session.players[1];

		if (session.breaker === 'none') {

			if (p1.score > p2.score) {
				
				gameResult = {
					winner_id: p1.playerId,
					loser_id: p2.playerId,
					winner_score: p1.score,
					loser_score: p2.score
				}
			} else {
				gameResult = {
					winner_id: p2.playerId,
					loser_id: p1.playerId,
					winner_score: p2.score,
					loser_score: p1.score
				}
			}
		}
		else {
			if (session.breaker === 'p2') {
				
				gameResult = {
					winner_id: p1.playerId,
					loser_id: p2.playerId,
					winner_score: WINNING_SCORE,
					loser_score: 0
				}
			} else {
				gameResult = {
					winner_id: p2.playerId,
					loser_id: p1.playerId,
					winner_score: WINNING_SCORE,
					loser_score: 0
				}
			}
		}

		// console.log("  ### game result: ", gameResult);

		const jsonGameResutl = JSON.stringify(gameResult);
		return jsonGameResutl;

	}

	public async endGame(sessionId: string, gameMode: GameMode): Promise<void> {
		const serverPrefx = process.env.NODE_ENV == "deployment" ? "internal" : "api" 
		// if (gameMode === 'local')
		//     session = this.localSessions.get(sessionId);
		// else
		// 	session = this.remoteSessions.get(sessionId);
		
		// 1. Find the session
		const session: PongSession | undefined = this.getSession(sessionId);
		// 2. Safety Check
		if (!session) {
			console.error(`[PongRoom] Cannot end: Session ${sessionId} not found.`);
			return;
		}
	
		// 3. Mark as Finished 
		// (The Global Loop will see this and stop updating physics)
		if (session.breaker === 'none')
			session.state = 'finished';
		else
			session.state = 'break';
	
		// store the finale score !!
		if (gameMode === 'remote') {
			try {
				const jsonGameResult = this.getJsonGameResult(session);
				// const PORT: number = 3000;
				// console.log(`[Storage] Saving match ${session.sessionId} to DB...`);
	
	
				// console.log(`  ### prefex: ${serverPrefx} ### `);
				const res = await fetch(`http://backend:3000/${serverPrefx}/games`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						   'x-internal-secret': process.env.INTERNAL_SECRET || 'non'
					},
					body: jsonGameResult
				})
	
				// throw if res is not ok
				if (!res.ok) {
					const errorText = await res.text();
					throw new Error(`HTTP Error ${res.status}: ${errorText}`);
				}
		
				const data = await res.json();
				// console.log("✅ [Storage] Game saved successfully:", data);
	
				// console.log(" ### response: ", res);
			
			} catch (err: any){
				console.error(` Failed to save Match Result for Session: ${err.message} `);
			}
		}
	
		// console.log(`[PongRoom] Game finished: ${sessionId}`);
		// if (session.breaker !== 'none') {
		// 	const breakMsg: PongSessionData = this.createBreakMsg(session);
		// 	sendWSMsg(breakMsg, session);
		// }
		// 5. send the result to backend (database)
		// later...
	
		// 6. reset the players objects
		resetPlayers(session.players[0].playerId, session.players[1].playerId, session.gameMode);
	
		// 7. Schedule Cleanup
		// Wait 10 seconds to let clients read the score, then delete.
		setTimeout(() => {
			this.removeSession(sessionId, gameMode);
			// console.log(`[ Remove Session ]: game mode: ${gameMode} || sessionId: ${sessionId}`);
		}, 10000);
	}


	//  ======================== [REMOTE MODE] ======================

	// add player to remote waiting room
	public addToWaitingRoom(player: GamesPlayer) {
		
		// 1. Avoid duplicates
        // 1. Avoid duplicates
        if (this.waitingPlayersQueue.find(p => p.playerId === player.playerId)) {
            // console.log("Player already in queue");
            return null; 
        }

		// 2. Add to Queue
        this.waitingPlayersQueue.push(player);
        // console.log(`[Queue] Player added. Size: ${this.waitingPlayersQueue.length}`);

		player.playerState = 'WAITING_MATCH';
	}

	// match making
	public matchMaking(player: GamesPlayer) {

		// 1. get size
		const size: number = this.waitingPlayersQueue.length;
        // console.log(`[Queue] Player added. Size: ${size}`);

		// 2. CHECK 1: are there enough players ???
        if (size > 1) {
			// A. Pop the first two players
            const player1 = this.waitingPlayersQueue.shift()!;
            const player2 = this.waitingPlayersQueue.shift()!;

			// B. Assign Sides
            // (You might need to update the internal PongPlayer inside GamesPlayer here)
            player1.pongPlayer!.side = 'left';
            player2.pongPlayer!.side = 'right';

			// reset Paddles based on side
			pongEngine.resetPaddle(player1.pongPlayer!.paddle, 'left');
			pongEngine.resetPaddle(player2.pongPlayer!.paddle, 'right');

			// C. Update States
			player1.playerState = 'READY';
			player2.playerState = 'READY';

			// D. Create the Session
            const newSessionId = this.createSession(player1.pongPlayer!, player2.pongPlayer!, 'remote');
			player1.pongPlayer!.sessiondId = newSessionId;
			player2.pongPlayer!.sessiondId = newSessionId;

			// E. Add players to playing room
			addToPlayingPlayersRoom(player1.playerId);
			addToPlayingPlayersRoom(player2.playerId);

			// D. IMPORTANT: We need to tell Player 1 (who is waiting) that the game started!
            // We return the info needed to notify them.
			// return {
            //     sessionId: newSessionId,
            //     side: 'right', // The player who triggered this (Player 2) gets Right
            //     opponent: player1 // The waiting player (Player 1)
            // };

			// console.log(`[Matchmaking] Session Created: ${newSessionId}`);

			return newSessionId;
		}

		// 3. Not enough players yet
        return null;
	}

	// { sessionId: string, side: Side, opponent?: GamesPlayer } | null

	// Matchmaking: Find a session that is waiting for a player
	// public findWaitingSession(): string | null {
    //     for (const [id, session] of this.remoteSessions) {
    //         if (session.state === 'waiting' && session.players.length === 1) {
    //             return id;
    //         }
    //     }
    //     return null;
    // }

	// Create a session with ONLY Player 1:
	public createRemoteSession(player1: PongPlayer): string {
		// const newId = randomUUID();

		// create new game session
		const newId: string = this.createSession(player1, null, 'remote');
        // console.log(`[PongRoom] Remote Session Waiting: ${newId}`);

		return newId;
	}

    // Add Player 2 to an existing session.    
    // public joinRemoteSession(sessionId: string, player2: PongPlayer): string {
	// 	const session = this.remoteSessions.get(sessionId);

	// 	if (!session || session.state !== 'waiting') {
    //         throw new Error("Session not available or not found");
    //     }

	// 	// Add Player 2
    //     session.players.push(player2);

	// 	session.state = 'ready';

	// 	console.log(`[PongRoom] Player 2 joined Session: ${sessionId}`);
    //     return sessionId;
	// }

	// ================================================================
}

export  {
	// PongGameConfig, 
	// PongConstants,
	PongSessionsRoom,
	PongSession,
	// LocalPongSession
};