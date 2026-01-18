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

	public canvas: HTMLCanvasElement | null = null;

	// public pongRenderer: PongRenderer | null = null;

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

	public reset() {
		this.playerState = 'IDLE';
		this.game = null;
		this.gameMode = null;
		this.playMode = null;
		this.friendName = null;
		this.gameId = null;
		this.side = null;
		// this.pongRenderer = null;
		// this.cleanupGamePage();
	}


	private createSetupRequest(): HttpPongSetupReq {
		// 1. Validation: Ensure we aren't sending nulls
		// if (!this.game || !this.gameMode || !this.playMode || !this.playerName) {
		//     throw new Error("❌ Game Client State Incomplete: Cannot build setup request.");
		// }
		
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
			// Note: Make sure your backend endpoint matches this URL
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
        // 2. Just store the canvas reference
        this.canvas = canvas;
    }

    public cleanupGamePage() {
        // Clear it when leaving so i don't draw
        this.canvas = null;
    }
	// public initGamePage(canvas: HTMLCanvasElement) {

	// 	console.log("🎮 Init game page logic...");
		
	// 	// 1. Create the Renderer
    // 	this.pongRenderer = new PongRenderer(canvas);

	// 	// // 2. Connect the WebSocket handler class to the Renderer (plug the listener).
    // 	// this.wsConnectionsHandler.setGameUpdateListenerCallback((data) => {
	// 	// 	// draw the data!
	// 	// 	if (this.pongRenderer) {
	//     //     	this.pongRenderer!.draw(data);
	// 	// 	}
	// 	// });
	// }

	// public cleanupGamePage() {
	// 	// Unplug the listener
	// 	gameClient.wsConnectionsHandler.setGameUpdateListenerCallback(null);
	// }
}

// GameClient.prototype.createSetupRequest = function(): HttpPongSetupReq {
// 	// 1. Validation: Ensure we aren't sending nulls
//     // if (!this.game || !this.gameMode || !this.playMode || !this.playerName) {
//     //     throw new Error("❌ Game Client State Incomplete: Cannot build setup request.");
//     // }
	
// 	const req: HttpPongSetupReq = {
// 		game: this.game!,
// 		gameMode: this.gameMode!,
// 		playMode: this.playMode!,
// 		player1: this.playerName!,
// 		player2: this.friendName!
// 	}
// 	return req;
// }


// Export the Single Instance directly for ease of use
// this exports the INSTANCE, not the class.
export const gameClient = GameClient.getInstance();




	// // 2. The Setup (Game Mode, Play Mode...)
	// // specific defaults can be set here
	// public config: GameConfig = {
	//     gameMode: 'local',  // Default to local for safety
	//     playMode: 'random'
	// };

	// // 3. & 4. & 5. The Game Objects (Players + Ball)
	// // We initialize them with default positions (e.g., center screen)
	// public state: PongState = {
	//     status: 'IDLE',
		
	//     // Shared Game Object (Ball)
	//     ball: { x: 50, y: 50 },

	//     // Player 1 (The Main Client / You)
	//     player1: { 
	//         y: 50, 
	//         score: 0, 
	//         name: 'Player 1', 
	//         isReady: false 
	//     },

	//     // Player 2 (The Opponent OR Local Friend)
	//     player2: { 
	//         y: 50, 
	//         score: 0, 
	//         name: 'Player 2', 
	//         isReady: false 
	//     }
	// };

		// // --- METHODS ---
	// /**
	//  * Call this to save the user's menu choices
	//  */
	// public updateConfig(newConfig: Partial<GameConfig>) {
	//     this.config = { ...this.config, ...newConfig };
	//     console.log("⚙️ Config Updated:", this.config);
	// }

	// /**
	//  * Store the active WebSocket connection here
	//  */
	// public setSocket(socket: WebSocket) {
	//     this.socket = socket;
	// }

	// /**
	//  * Reset the game state to defaults (useful after a game finishes)
	//  */
	// public resetState() {
	//     this.state.score1 = 0;
	//     this.state.score2 = 0;
	//     this.state.ball = { x: 50, y: 50 };
	//     this.state.status = 'IDLE';
	// }

	// /**
	//  * MENTIONED: The Game Bootstrap Method
	//  * This will be called when the game actually starts.
	//  * It will handle rendering the canvas and starting the loop.
	//  */
	// public bootstrap(canvasElement: HTMLCanvasElement) {
	//     console.log("🚀 Bootstrapping Game Renderer...");
		
	//     if (this.config.gameMode === 'local') {
	//         console.log("⌨️ Binding Local Controls for Player 2 (Friend)");
	//         // Logic to listen to Arrow Keys for Player 2 will go here
	//     } else {
	//         console.log("🌐 Waiting for Remote Server updates for Player 2");
	//     }

	//     // renderGame(canvasElement, this.state); // Future implementation
	// }