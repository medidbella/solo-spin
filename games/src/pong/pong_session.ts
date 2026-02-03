
import { PongPlayer, PongSession, GameResult } from "./pong_types";
import { GamesPlayer } from '../game_manager/games_types';
import { addToPlayingPlayersRoom, isPlayerExist } from '../game_manager/games_utiles';
import { pongGameSessionsRoom, pongEngine } from './pong_memory';
import { createBall } from './pong_utils';
import { randomUUID } from 'crypto';
import { GameMode, PongSessionData } from '../../../shared/types'
import { sendWSMsg } from '../ws/ws_handler';
import { GAME_STATE_UPDATE_INTERVAL_MS, WINNING_SCORE, PINGTIMEOUT, STARTGAMETIMEOUT, REMOVESESSIONDELAY, DELETEPLAYERTIMEOUT } from '../../../shared/pong_constants';
import { availablePlayersRoom, onlinePlayersRooom, playingPlayersRoom } from '../game_manager/games_memory';
import { getBreaker, getPlayer, resetPlayers, resetPlayerStatesIfAlreadyExist } from '../game_manager/games_utiles';
import { storeMatchResult } from './pong_utils';

function createLocalPongSession(players: GamesPlayer[]): string {

	const player1: PongPlayer = players[0].pongPlayer!;
	const player2: PongPlayer = players[1].pongPlayer!;

	const sessionId: string = pongGameSessionsRoom.createSession(player1, player2, 'local');
	player1.sessiondId = sessionId;
	player2.sessiondId = sessionId;

	addToPlayingPlayersRoom(players[0].playerId);
	players[0].playerState = 'READY';

	return sessionId;
}

class PongSessionsRoom {

	// ------------ Properties -----------------------------
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
        this.startGlobalLoop();
	}

	public static getInstance(): PongSessionsRoom {
		if (!PongSessionsRoom.instance) {
			PongSessionsRoom.instance = new PongSessionsRoom();
		}
		return PongSessionsRoom.instance;
	}

    // --- Methods ---
    public createSession(player1: PongPlayer, player2: PongPlayer | null, gameMode: GameMode): string {
        const newId = randomUUID();

		const players: PongPlayer[] = [player1];
		if (player2)
			players.push(player2);

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
        
        return newId;
    }

    public getSession(sessionId: string): PongSession | undefined {

		let session: PongSession | undefined = this.localSessions.get(sessionId);
		if (!session)
			session = this.remoteSessions.get(sessionId);
		return session;
    }

    public removeSession(sessionId: string, gameMode: GameMode): boolean {
		let deleted: boolean;
		if (gameMode === 'local')
        	deleted = this.localSessions.delete(sessionId);
		else
			deleted = this.remoteSessions.delete(sessionId);
        return deleted;
    }

	private startGlobalLoop(): void {
        console.log("[PongRoom] Global Game Loop Started!");
        this.localSessionsTickInterval = setInterval(() => {
            this.localSessions.forEach((session: PongSession, sessionId: string) => {
                if (session.state === 'playing') {
                    const results: PongSessionData = pongEngine.gameTick(session);
					sendWSMsg(results, session);
				}

			});

		},  GAME_STATE_UPDATE_INTERVAL_MS);

		this.remoteSessionsTickInterval = setInterval(() => {
			this.remoteSessions.forEach((session: PongSession, sessionId: string) => {
				if (session.state === 'playing') {
					const results: PongSessionData = pongEngine.gameTick(session);
					sendWSMsg(results, session);
				}
			});

		}, GAME_STATE_UPDATE_INTERVAL_MS);

		this.WsPingInterval = setInterval(() => {
		
			onlinePlayersRooom.forEach((player: GamesPlayer, playerId: string) => {
				if (player.ws && player.isWsAlive === false) {
					player.ws.removeAllListeners();
					player.ws.terminate();
					return
				}
				player.isWsAlive = false;
				if (player.ws)
					player.ws.ping();
			});
		
		}, PINGTIMEOUT);
	}

	public startDeletePlayerTimeOut(playerId: string) {
		const player: GamesPlayer = getPlayer(playerId);
		setTimeout(() => {
				if (player.ws && player.ws.readyState === WebSocket.OPEN)
					return ;

				if (player.playerState === 'PLAYING') {
					resetPlayerStatesIfAlreadyExist(playerId);
				}

				setTimeout(() => {
					console.log(" [PongRoom] Delete player object ")
					onlinePlayersRooom.delete(playerId);
					availablePlayersRoom.delete(playerId);
					playingPlayersRoom.delete(playerId);
				}, DELETEPLAYERTIMEOUT);

		}, 1000);
	}

	public stopGlobalLoop(): void {
        console.log("[PongRoom] Stopping Global Game Loops...");

        if (this.localSessionsTickInterval) {
            clearInterval(this.localSessionsTickInterval);
            this.localSessionsTickInterval = null;
        }

        if (this.remoteSessionsTickInterval) {
            clearInterval(this.remoteSessionsTickInterval);
            this.remoteSessionsTickInterval = null;
        }

        if (this.WsPingInterval) {
            clearInterval(this.WsPingInterval);
            this.WsPingInterval = null;
        }

        console.log("[PongRoom] All loops stopped.");
    }

	private async handlesStartGameTimeout(session: PongSession, playerId: string) {

		session.breaker = getBreaker(session, playerId);
		session.timeOuted = true;

		await pongGameSessionsRoom.endGame(session.sessionId, session.gameMode);
	}

    public startGame(sessionId: string, playerId: string): void {

		const session: PongSession | undefined = this.getSession(sessionId)

		if (!session)
            return;

		if (session.gameMode == 'remote') {
			session.playerStarted++;

			if (session.playerStarted === 1) {
				session.startGameTimeoutChecker = setTimeout(() => {
                    this.handlesStartGameTimeout(session, playerId);
                }, STARTGAMETIMEOUT);

				return;
			}

			else if (session.playerStarted === 2) {
                if (session.startGameTimeoutChecker) {
                    clearTimeout(session.startGameTimeoutChecker);
                    session.startGameTimeoutChecker = undefined;
                }
			}
		}

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
		
        console.log(`[PongRoom] Game started: ${sessionId}`);
    }

	private getJsonGameResult(session: PongSession): any {

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

		const jsonGameResutl = JSON.stringify(gameResult);
		return jsonGameResutl;

	}

	public async endGame(sessionId: string, gameMode: GameMode): Promise<void> {
		const serverPrefx = process.env.NODE_ENV == "deployment" ? "internal" : "api" 

		const session: PongSession | undefined = this.getSession(sessionId);
		if (!session) {
			console.error(`[PongRoom] Cannot end: Session ${sessionId} not found.`);
			return;
		}
	
		if (session.breaker === 'none')
			session.state = 'finished';
		else
			session.state = 'break';
	
		if (gameMode === 'remote') {
			try {
				const jsonGameResult = this.getJsonGameResult(session);
				const data = await storeMatchResult(jsonGameResult);
			
			} catch (err: any){
				console.error(` Failed to save Match Result for Session: ${err.message} `);
			}
		}

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
						if (player1 && player1.ws) 
							player1.ws.send(JSON.stringify(stopMsg));

						if (player2 && player2.ws)
							player2.ws.send(JSON.stringify(breakMsg));
					}
					else if (session.breaker === 'p2') {
						if (player1 && player1.ws)
							player1.ws.send(JSON.stringify(breakMsg));
							
						if (player2 && player2.ws)
							player2.ws.send(JSON.stringify(stopMsg));

					}
				}
		}

		resetPlayers(session.players[0].playerId, session.players[1].playerId, session.gameMode);
	
		setTimeout(() => {
			this.removeSession(sessionId, gameMode);
		}, REMOVESESSIONDELAY);
	}


	//  ======================== [REMOTE MODE] ======================

	public addToWaitingRoom(player: GamesPlayer) {
		
        if (this.waitingPlayersQueue.find(p => p.playerId === player.playerId))
            return null; 

        this.waitingPlayersQueue.push(player);

		player.playerState = 'WAITING_MATCH';
	}

	// match making
	public matchMaking(player: GamesPlayer) {

		const size: number = this.waitingPlayersQueue.length;

        if (size > 1) {
            const player1 = this.waitingPlayersQueue.shift()!;
            const player2 = this.waitingPlayersQueue.shift()!;

            player1.pongPlayer!.side = 'left';
            player2.pongPlayer!.side = 'right';

			pongEngine.resetPaddle(player1.pongPlayer!.paddle, 'left');
			pongEngine.resetPaddle(player2.pongPlayer!.paddle, 'right');

			player1.playerState = 'READY';
			player2.playerState = 'READY';

            const newSessionId = this.createSession(player1.pongPlayer!, player2.pongPlayer!, 'remote');
			player1.pongPlayer!.sessiondId = newSessionId;
			player2.pongPlayer!.sessiondId = newSessionId;

			addToPlayingPlayersRoom(player1.playerId);
			addToPlayingPlayersRoom(player2.playerId);

			return newSessionId;
		}

        return null;
	}

	public createRemoteSession(player1: PongPlayer): string {

		const newId: string = this.createSession(player1, null, 'remote');
        console.log(`[PongRoom] Remote Session Waiting: ${newId}`);

		return newId;
	}

}

export { createLocalPongSession, PongSessionsRoom };