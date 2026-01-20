// import { GameConfig, PongState } from "../types/PongTypes";

import type { PlayerState, GameMode, AvailableGames, PlayMode, Side
				, HttpPongSetupReq, HttpSetupResponse, PongSessionData } from "@shared/types";

// import { wsConnectionsHandler } from "./ws_handler";
import { WSConnectionsHandler } from "./ws_handler";

// import { PongRenderer } from './pong_renderer';

class GameClient {
	public wsConnectionsHandler: WSConnectionsHandler;

	private playerState: PlayerState;
	private playerName: string | null = null;
	private game: AvailableGames | null = null;
	private gameMode: GameMode | null = null;
	private playMode: PlayMode | null = null;
	private friendName: string | null = null;
	private side: Side | null = null;
	
	private gameId: string | null = null;
	private	hasStarted: boolean = false;
	private inputLoopId: number | null = null;
	public canvas: HTMLCanvasElement | null = null;

	// I store the specific function references here so i can remove them later (when the game finished or the client leaves the game page)
    private cleanupListeners: (() => void) | null = null;
	private hasReseted: boolean = true;


	// /**
	//  * Singleton Instance:
	//  * This ensures we don't accidentally create two versions of the game state.
	//  */
	private static instance: GameClient;

	private constructor() {
		this.playerState = 'IDLE';

		// SINGLE instance
		this.wsConnectionsHandler = new WSConnectionsHandler();
    	// this.pongRenderer = new PongRenderer(canvas);
		console.log("🎮 Game Client Initialized");
	}

	public static getInstance(): GameClient {
		if (!GameClient.instance) {
			GameClient.instance = new GameClient();
		}
		return GameClient.instance;
	}

	// ------------ METHODS ----------------

	public setPlayerState(state: PlayerState) { this.playerState = state; }
	public getPlayerState(): PlayerState { return this.playerState; }

	public setPlayerName(playerName: string) { this.playerName = playerName; }
	public getPlayerName(): string | null { return this.playerName; }

	public setGame(game: AvailableGames) { this.game = game; }
	public getGame(): AvailableGames | null { return this.game; }

	public setGameMode(gameMode: GameMode) { this.gameMode = gameMode; }
	public getGameMode(): GameMode | null { return this.gameMode; }

	public setPlayMode(playMode: PlayMode) { this.playMode = playMode; }
	public getPlayMode(): PlayMode | null { return this.playMode; }

	public setFriendName(friendName: string) { this.friendName = friendName; }
	public getFriendName(): string | null { return this.friendName; }

	public setGameId(gameId: string) { this.gameId = gameId; }
	public getGameId(): string | null { return this.gameId; }

	public setSide(side: Side) { this.side = side; }
	public getSide(): Side | null { return this.side; }

	public setHasStarted(hasStarted: boolean) { this.hasStarted = hasStarted; }
	public getHasStarted(): boolean { return this.hasStarted; }

	public setInputLoopId(id: number | null) { this.inputLoopId = id; }
	public getInputLoopId(): number | null { return this.inputLoopId; }

	public setHasReseted(hasReseted: boolean) { this.hasReseted = hasReseted; }
	public getHasReseted(): boolean { return this.hasReseted; }

	public setCleanupListeners(cleanupFn: () => void) {
        this.cleanupListeners = cleanupFn;
    }

	public reset() {
		// Reset Game Config
		this.playerState = 'IDLE';
		this.game = null;
		this.gameMode = null;
		this.playMode = null;
		this.friendName = null;
		this.gameId = null;
		this.side = null;
		this.cleanupGamePage();

		this.hasReseted = true;
		console.log("  #### RESETED THE GAME ####");
	}

	public cleanupGamePage() {
		console.log("🧹 Cleaning up game page...");

		// 1. Stop the Input Loop
        if (this.inputLoopId) {
            window.clearInterval(this.inputLoopId);
            this.inputLoopId = null;
        }

		// 2. Remove Event Listeners
        if (this.cleanupListeners) {
            this.cleanupListeners();
            this.cleanupListeners = null;
        }

		// 3. Release DOM References
        this.canvas = null;

		// 4. Reset Status
		this.hasStarted = false;
	}


	private createSetupRequest(): HttpPongSetupReq {		
		const req: HttpPongSetupReq = {
			game: this.game!,
			gameMode: this.gameMode!,
			playMode: this.playMode!,
			player1: this.playerName!,
			player2: this.friendName!
		}
		return req;
	}


	public async sendSetUpRequest(): Promise<HttpSetupResponse> {

		try {
			// 1. Get the data
			const reqData = this.createSetupRequest();
	
			console.log("📤 Sending Game Setup:", reqData);
	
			// 2. Send the Request
			const response = await fetch('/api/games/pong', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(reqData)
			});
	
			// 3. Parse JSON response
			const data = await response.json();
	
			// 4. Handle HTTP Errors (like 400 Bad Request or 500 Server Error)
			if (!response.ok) {
				return {
					status: 'error',
					error: data.message || "Server Error"
					// code: response.status
				};
			}
	
			// 5. Success
			return data as HttpSetupResponse;
	
	
		} catch (err) {
			// Network errors (server down, no internet)
			console.error("❌ Network Error:", err);
			return {
				status: 'error',
				error: "Network connection failed"
			};
		}
	}

	// ---------- Helpers ----------------------------
	public initGamePage(canvas: HTMLCanvasElement) {
        console.log("🎮 Init game page...");
        // 1. Just store the canvas reference
        this.canvas = canvas;

		// 2. set state
		this.hasReseted = false // means the game is getting started or already started!
    }

	public inputHandlerCleanup() {};
}

// Export the Single Instance directly for ease of use
// this exports the INSTANCE, not the class.
export const gameClient = GameClient.getInstance();
