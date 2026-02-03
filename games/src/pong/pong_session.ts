
import { PongPlayer, PongSession, GameResult } from "./pong_types";
import { GamesPlayer } from '../game_manager/games_types';
import { addToPlayingPlayersRoom } from '../game_manager/games_utiles';
import { pongGameSessionsRoom, pongEngine } from './pong_memory';
import { createBall } from './pong_utils';
import { randomUUID } from 'crypto';
import { GameMode, PongSessionData } from '../../../shared/types'
import { sendWSMsg } from '../ws/ws_handler';
import { GAME_STATE_UPDATE_INTERVAL_MS, WINNING_SCORE, PINGTIMEOUT, STARTGAMETIMEOUT, REMOVESESSIONDELAY } from '../../../shared/pong_constants';
import { onlinePlayersRooom, playingPlayersRoom } from '../game_manager/games_memory';
import { getBreaker, getPlayer, resetPlayers } from '../game_manager/games_utiles';
import { storeMatchResult } from './pong_utils';

function createLocalPongSession(players: GamesPlayer[]): string {

	const player1: PongPlayer = players[0].pongPlayer!;
	const player2: PongPlayer = players[1].pongPlayer!;

	const sessionId: string = pongGameSessionsRoom.createSession(player1, player2, 'local');
	player1.sessiondId = sessionId;
	player2.sessiondId = sessionId;


	// set state of player object belongs to the client
	addToPlayingPlayersRoom(players[0].playerId);
	players[0].playerState = 'READY';

	return sessionId;
}

// ----------- Pong Game Session ------------------------


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
			nextRoundStartTimestamp: 0,
			stop: false,
			timeOuted: false
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

	private async handlesStartGameTimeout(session: PongSession, playerId: string) {

		console.log("  ===>> Time outEd  <<==");

		session.breaker = getBreaker(session, playerId);
		session.timeOuted = true;

		await pongGameSessionsRoom.endGame(session.sessionId, session.gameMode);
	}

    /**
     * 3. Start the game: Set state = 'playing'
     */
    public startGame(sessionId: string, playerId: string): void {

		const session: PongSession | undefined = this.getSession(sessionId)

		if (!session) {
            // console.error(`[PongRoom] Cannot start: Session ${sessionId} not found.`);
            return;
        }

		if (session.gameMode == 'remote') {
			// 1. Increment Count
			session.playerStarted++;
			// console.log(`   **************** Started Players: ${session.playerStarted} *********************** `)

			if (session.playerStarted === 1) {
				session.startGameTimeoutChecker = setTimeout(() => {
					// session.breaker = (session.players[0].playerId === playerId) ? 'p1' : 'p2';
                    this.handlesStartGameTimeout(session, playerId);
                }, STARTGAMETIMEOUT);

				return;
			}

			else if (session.playerStarted === 2) {
				// CANCEL THE TIMER! Important!
                if (session.startGameTimeoutChecker) {
                    clearTimeout(session.startGameTimeoutChecker);
                    session.startGameTimeoutChecker = undefined;
                }
			}
		}

		// 1. Mark as ready:
        session.state = 'playing';
		const player1: GamesPlayer = getPlayer(session.players[0].playerId);
		let player2: GamesPlayer | undefined;
		if (session.gameMode === 'remote')
			player2 = getPlayer(session.players[1].playerId);
		else
			player2 = playingPlayersRoom.get(session.players[1].playerId);

		if (player1)
			player1.playerState = 'PLAYING';
		if (player2)
			player2.playerState = 'PLAYING';
		
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

		// console.log(" ********* Ending the Game *********");
		
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
				const data = await storeMatchResult(jsonGameResult);
			
			} catch (err: any){
				console.error(` Failed to save Match Result for Session: ${err.message} `);
			}
		}

		// console.log(`  Game Mode ==> ${gameMode} <=== `);

		if (session.breaker !== 'none' && (session.stop || session.timeOuted)) {	
				const stopMsg = pongEngine.createStopGameMsg(sessionId);
				
				let player1: GamesPlayer | null;
				let player2: GamesPlayer | null;

				if (gameMode === 'local') {
					player1 = getPlayer(session.players[0].playerId);
					if (player1 && player1.ws)
						player1.ws.send(JSON.stringify(stopMsg));
				} else {
					const breakMsg : PongSessionData = pongEngine.createResutlsMsg(session);
					player1 = getPlayer(session.players[0].playerId);
					player2 = getPlayer(session.players[1].playerId);

					if (session.breaker === 'p1') {
						if (player1 && player1.ws) {
							// console.log("   Stop message to player 1");
							player1.ws.send(JSON.stringify(stopMsg));
						}

						if (player2 && player2.ws) {
							// console.log("   Break message to player 2");
							player2.ws.send(JSON.stringify(breakMsg));
						}
					}
					else if (session.breaker === 'p2') {
						if (player1 && player1.ws) {
							// console.log("   Break message to player 1");
							player1.ws.send(JSON.stringify(breakMsg));
						}
							
						if (player2 && player2.ws) {
							// console.log("   Stop message to player 2");
							player2.ws.send(JSON.stringify(stopMsg));
						}
					}
				}
		}

	
		// 6. reset the players objects
		resetPlayers(session.players[0].playerId, session.players[1].playerId, session.gameMode);
	
		// 7. Schedule Cleanup
		// Wait 10 seconds to let clients read the score, then delete.
		setTimeout(() => {
			this.removeSession(sessionId, gameMode);
			// console.log(`[ Remove Session ]: game mode: ${gameMode} || sessionId: ${sessionId}`);
		}, REMOVESESSIONDELAY);
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
			// console.log(`[Matchmaking] Session Created: ${newSessionId}`);

			return newSessionId;
		}

		// 3. Not enough players yet
        return null;
	}

	// Create a session with ONLY Player 1:
	public createRemoteSession(player1: PongPlayer): string {
		// const newId = randomUUID();

		// create new game session
		const newId: string = this.createSession(player1, null, 'remote');
        // console.log(`[PongRoom] Remote Session Waiting: ${newId}`);

		return newId;
	}

}

export { createLocalPongSession, PongSessionsRoom };