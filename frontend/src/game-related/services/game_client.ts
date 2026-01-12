// import { GameConfig, PongState } from "../types/PongTypes";

import type { GameMode, AvailableGames, PlayMode } from "@shared/types";
import { wsConnectionsHandler } from "./ws_handler";

class GameClient {
	// 1. The Socket (Communication Line)
	// private socket: WebSocket | null = null;
	public wsConnectionsHandler = wsConnectionsHandler;

	private playerName: string | null = null;
	private game: AvailableGames | null = null;
	private gameMode: GameMode | null = null;
	private playMode: PlayMode | null = null;

	// /**
	//  * Singleton Instance:
	//  * This ensures we don't accidentally create two versions of the game state.
	//  */
	private static instance: GameClient;

	private constructor() {
		// Private constructor prevents direct "new GameClient()" calls
		// this.wsConnectionsHandler = wsConnectionsHandler;
		// this.wsConnectionsHandler.connect();
		console.log("🎮 Game Client Initialized");
	}

	public static getInstance(): GameClient {
		if (!GameClient.instance) {
			GameClient.instance = new GameClient();
		}
		return GameClient.instance;
	}

	// ------------ METHODS ----------------

	public setPlayerName(playerName: string) { this.playerName = playerName; }
	public getPlayerName(): string | null { return this.playerName };

	public setGame(game: AvailableGames) { this.game = game; }
	public getGame(): AvailableGames | null { return this.game; }

	public setGameMode(gameMode: GameMode) { this.gameMode = gameMode; }
	public getGameMode(): GameMode | null { return this.gameMode; }

	public setPlayMode(playMode: PlayMode) { this.playMode = playMode; }
	public getPlayMode(): PlayMode | null { return this.playMode; }

}

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