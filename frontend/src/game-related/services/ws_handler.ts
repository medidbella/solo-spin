
// import { WebSocket } from 'ws';
import type { ClientMessage, WSMsgType, ServerMessage,
				AvailableGames, PongInput, WSPongStartGameMessage, inputPlayer,
				PongSessionData, WSPongInput, 
				GameMode} from "@shared/types"; 
import { gameClient } from "./game_client";
import { renderPongFrame } from './pong_renderer';
import { handleGameOver } from '../renders/game_play';

// Access the variables using import.meta.env
const port = import.meta.env.VITE_NGINX_PORT;
const host = import.meta.env.VITE_HOST;
const url = `ws://${host}:${port}/ws/games/`;

// // import { gameClient } from './game_client';

// type pongMoves = 'UP' | 'DOWN' | 'STOP' | 'CONTINUE';

// // ---------- SYSTEM MESSAGES (Handshake) ----------------

// export interface WSConnectMessage {
// 	type: 'CONNECT';
// 	payload: {
// 		// game: GameType;
// 		// username: string;
// 	};
// }

// export interface WSConnectSuccess {
// 	type: 'CONNECT_SUCCESS';
// 	payload: {
// 		playerId: string;
// 		ready: boolean;
// 	};
// }

// export interface WSConnectError {
// 	type: 'CONNECT_ERROR';
// 	payload: {
// 		error: string;
// 	};
// }
// // ----------------------------------------------------

// // ---------------- GAME MESSAGES (The Fun Part) ------

// // A. PONG
// export interface WSPongInput {
// 	type: 'GAME_INPUT';
// 	game: 'pong';
// 	payload: {
// 		move: pongMoves; // Simple directions
// 	};
// }

// // B. SUDOKU (Placeholder for later)
// export interface WSSudokuInput {
// 	type: 'GAME_INPUT';
// 	game: 'sudoku';
// 	payload: {
// 		row: number;
// 		col: number;
// 		value: number;
// 	};
// }

// type ClientMessage = WSConnectMessage | WSPongInput | WSSudokuInput;
// ---------------------------------------------------------

// ------- WS connections hanlder (send/receive) ------------
type GameUpdateCallback = (data: any) => void;

export class WSConnectionsHandler {

	private socket: WebSocket | null = null;
	private onGameUpdate: GameUpdateCallback | null = null;

	/**
    	* Allow the Frontend to register a listener
    	* When the Game Page loads then it will pass the 'draw()' function here.
    */
	public setGameUpdateListenerCallback(callback: GameUpdateCallback | null) {
		console.log('Set the Call back');
        this.onGameUpdate = callback;
    }

	private createWSConnectMessage(): ClientMessage {
		const message: ClientMessage = {
			type: 'CONNECT',
			payload: { }
		};

		return message;
	}

	private createWSStartGameMessage(game: AvailableGames, gameId: string): ClientMessage {
		const message: WSPongStartGameMessage = {
			type: 'START_GAME',
			game,
			payload: {
				gameId
			}
		};
		return message;
	}

	private createWSGameInputMessage(gameId: string, move: PongInput) {
		let inputPlayer: inputPlayer;

		if (move === 'W' || move === 'S')
			inputPlayer = 'LEFT';
		else
			inputPlayer = 'RIGHT';

		const message: WSPongInput = {
			type: 'GAME_INPUT',
			game: 'pong',
			payload: {
				gameId,
				inputPlayer,
				move
			}
		}
		return message;
	}

	private sendWSMessage(msg: ClientMessage) {
		this.socket!.send(JSON.stringify(msg));
	}

	public createAndSendMessages(game: AvailableGames, type: WSMsgType, sessionId: string, move: PongInput | null) {
		let message: ClientMessage;

		if (type == 'CONNECT')
			message = this.createWSConnectMessage();
		else if (type === "START_GAME")
			message = this.createWSStartGameMessage(game, sessionId!);
		else if (type === 'GAME_INPUT') {
			message = this.createWSGameInputMessage(sessionId, move!);
		}
		this.sendWSMessage(message!);
	}
	connect(): Promise<void> {

		return new Promise((resolve, reject) => {


			if (this.socket) {
				console.warn("⚠️ Socket already connected");
				reject();
			}	

			// 1. Create Socket
			console.log(`🔌 Connecting to ${url}...`);
			this.socket = new WebSocket(url);

			// 2. Handle Connection Success
			this.socket.onopen = () => {
				console.log('✅ Connection established!');

				// Send the initial CONNECT message
				this.createAndSendMessages('pong', 'CONNECT', null, null);
				// const msg = this.createWSConnectMessage();
				// this.sendWSMessage(msg);

				resolve(); // Unblock the await
			};

			// Handle Incoming Messages
            this.socket.onmessage = (event: MessageEvent) => {
                this.handleIncomingMessage(event);
            };

			this.socket.onerror = (error: any) => {
				console.error('❌ WebSocket error:', error);
				reject(error);
			};
	
			this.socket.onclose = () => {
				console.log('🔌 WebSocket Closed');
				this.socket = null;
				reject();
			};
		});
	}

	private handleIncomingMessage(event: MessageEvent) {
        try {
            // 1. Parse the string data into a JSON object
            const data = JSON.parse(event.data as string);
            // console.log("📩 Received:", data);
			const type: WSMsgType = data.type;
			// const payload = data.payload as PongSessionData;
            
			// console.log(`Ws message received, type: ${type} `);

            // 2. Route the message based on its type
			switch (type) {

				case 'GAME_STATE':
					if (this.onGameUpdate) {
						// console.log("Calling the call Back");
						// this.onGameUpdate(data);
					}

					// const convertedData: PongSessionData = data;
					// Check if we have a valid canvas to draw on
                    if (gameClient.canvas && data.payload) {
                        renderPongFrame(gameClient.canvas, data.payload);
                    }
					// gameClient.pongRenderer!.draw(convertedData);
					break ;

				// Handle Game Over
				case 'GAME_FINISHED':
					console.log("Game Finished");
					if (gameClient.canvas && data.payload) {

						// 1. Draw the final frame so players see the final score
                        renderPongFrame(gameClient.canvas, data.payload);

						// 2. Show the UI Overlay
						handleGameOver(data.payload);
                    }
					
					break ;
				
				default:
					break ;
			}
            

        } catch (err) {
            console.error("❌ received invalid JSON:", event.data);
        }
    }
}

// ## Export a SINGLE instance ##
// export WSConnectionsHandler;
// export const wsConnectionsHandler = new WSConnectionsHandler();