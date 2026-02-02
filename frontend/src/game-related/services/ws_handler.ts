
// import { WebSocket } from 'ws';
import type { ClientMessage, WSMsgType,
				AvailableGames, PongInput, WSPongStartGameMessage, inputPlayer,
				 WSPongInput, WSPongPauseMessage, WSPongResumeMessage, WSPongBreakMessage,
				PongSessionIsReady, ServerMessage, PongSessionData
			// } from '../../../../shared/types'; 
			} from '../../../shared/types'; 

import { gameClient } from "./game_client";
import { renderPongFrame } from './pong_renderer';
import { handleGameOver } from '../renders/game_play';
import { router } from '../../main';
import { navigateTo } from '../services/handle_pong_routes';

// Automatically detects if you are using 'http' or 'https'
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
// Automatically uses the current host (localhost or domain.com)
const host = window.location.hostname; 
// Automatically sets port (443 for https, 80 for http, or specific port if needed)
const port = window.location.port ? window.location.port : (protocol === 'wss' ? '443' : '80');
const gameWSUrl = `${protocol}://${host}:${port}/ws/games/`;
// console.log(` Game ES Url: ${gameWSUrl}`);

// ------- WS connections hanlder (send/receive) ------------
// type GameUpdateCallback = (data: any) => void;

export class WSConnectionsHandler {

	private socket: WebSocket | null = null;
	// public socket: WebSocket | null = null;

	// private onGameUpdate: GameUpdateCallback | null = null;

	/**
		* Allow the Frontend to register a listener
		* When the Game Page loads then it will pass the 'draw()' function here.
	*/
	// public setGameUpdateListenerCallback(callback: GameUpdateCallback | null) {
	// 	console.log('Set the Call back');
	//     this.onGameUpdate = callback;
	// }

	// private constructor() {
	// 	this.connect();
	// }

	public isSocketConnected(): boolean { 
		// 1. Check if socket object exists
        if (!this.socket) return false;

        // 2. Check if state is OPEN (ready to send/receive)
        return this.socket.readyState === WebSocket.OPEN;
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

	private createWSPauseGameMessage(gameId: string) {
		const message: WSPongPauseMessage = {
			type: 'PAUSE',
			game: 'pong',
			payload: {
				sessionId: gameId
			}
		};
		return message;
	}

	private createWSResumeGameMessage(gameId: string) {
		const message: WSPongResumeMessage = {
			type: 'RESUME',
			game: 'pong',
			payload: {
				sessionId: gameId
			}
		};
		return message
	}

	private createWSBreakGameMessage (gameId: string) {

		const message: WSPongBreakMessage = {
			type: 'BREAK',
			game: 'pong',
			payload: {
				sessionId: gameId
			}
		}
		return message;
	}

	private sendWSMessage(msg: ClientMessage) {
		this.socket!.send(JSON.stringify(msg));
	}

	// private isWinner(payload: PongSessionData) {

	// }


	public createAndSendMessages(game: AvailableGames, type: WSMsgType, sessionId: string | null, move: PongInput | null) {
		let message: ClientMessage;

		if (type == 'CONNECT')
			message = this.createWSConnectMessage();
		else if (type === "START_GAME")
			message = this.createWSStartGameMessage(game, sessionId!);
		else if (type === 'GAME_INPUT') {
			message = this.createWSGameInputMessage(sessionId!, move!);
		} else if (type === 'PAUSE') {
			message = this.createWSPauseGameMessage(sessionId!);
		} else if (type === 'RESUME') {
			message = this.createWSResumeGameMessage(sessionId!);
		} else if (type === 'BREAK') {
			message = this.createWSBreakGameMessage(sessionId!);
		}
		this.sendWSMessage(message!);
	}
	connect(): Promise<void> {

		console.log(" Client: Calling .connect()  ");
		return new Promise((resolve, reject) => {

			// Check: If already connected, just stop and say "OK"
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				// console.log("⚠️ Socket already connected, skipping...");
				resolve(); 
				return;
			}

			if (this.socket) {
				console.warn("⚠️ Socket already connected");
				reject();
			}	

			// 1. Create Socket
			// console.log(`🔌 Connecting to ${gameWSUrl}...`);
			this.socket = new WebSocket(gameWSUrl);

			// 2. Handle Connection Success
			this.socket.onopen = () => {
				console.log('Client: ✅ Connection established!');

				// Send the initial CONNECT message
				this.createAndSendMessages('pong', 'CONNECT', null, null);
				// const msg = this.createWSConnectMessage();
				// this.sendWSMessage(msg);

				resolve(); // Unblock the await
			};

			// Handle Incoming Messages
			this.socket.onmessage = (event: MessageEvent) => {
				// console.log("  ### Detect incoming Message ###");
				this.handleIncomingMessage(event);
			};

			this.socket.onerror = (error: any) => {
				console.error('❌ WebSocket error:', error);
				this.socket = null;
				history.pushState(null, '', `/login?error=${encodeURIComponent('WebSocket Closed')}`);
				router('/login');
				reject(error);
			};
	
			this.socket.onclose = () => {
				// console.log('🔌 WebSocket Closed');
				this.socket = null;
				history.pushState(null, '', `/login?error=${encodeURIComponent('WebSocket Closed')}`);
				router('/login');
				reject();
			};
		});
	}

	private handleIncomingMessage(event: MessageEvent) {
		try {
			// 1. Parse the string data into a JSON object
			let data: ServerMessage = JSON.parse(event.data as string) as ServerMessage;
			// console.log("📩 Received:", data);
			const type: WSMsgType = data.type as WSMsgType;
			// const payload = data.payload as PongSessionData;
			
			// console.log(`  =========>>> Ws message received, type: ${type} <<< ========`);

			// 2. Route the message based on its type
			switch (type) {

				case 'SESSION_READY':
					// console.log("🔔 Match Found! Navigating to game arena...");
					data = data as PongSessionIsReady;
					// 1. Save the received Game ID
					gameClient.setGameId(data.payload.sessionId);

					// 2. Confirm Side, player 1 is always left | this useless because i already set the side for the player 1 !!!
					gameClient.setSide('left');

					// 3. navigate to actual game page
					navigateTo('/games/pong/game-play');
					break ;

				case 'GAME_STATE':
					data = data as PongSessionData;
					// if (this.onGameUpdate) {
					// 	// console.log("Calling the call Back");
					// 	// this.onGameUpdate(data);
					// }

					// const convertedData: PongSessionData = data;
					// Check if we have a valid canvas to draw on
					// console.log("  ******** Incoming Ws Message type 'GAME_STATE' ******** ");
					if (gameClient.canvas && data.payload) {
						renderPongFrame(gameClient.canvas, data.payload);
					}
					// gameClient.pongRenderer!.draw(convertedData);
					break ;

				// Handle Game Over
				case 'GAME_FINISHED':
					// console.log("Game Finished");
					data = data as PongSessionData;
					if (gameClient.canvas && data.payload) {

						// 1. Draw the final frame so players see the final score
						renderPongFrame(gameClient.canvas, data.payload);

						// 2. Show the UI Overlay
						handleGameOver(data.payload);
					}
					break ;

				case 'BREAK':
					if (gameClient.canvas && data.payload) {

						// console.log(`  ==>> Catch Break Message <<==`);

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
