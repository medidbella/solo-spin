
import type { ClientMessage, WSMsgType,
				AvailableGames, PongInput, WSPongStartGameMessage, inputPlayer,
				 WSPongInput, WSPongPauseMessage, WSPongResumeMessage, WSPongBreakMessage,
				PongSessionIsReady, ServerMessage, PongSessionData
			} from '../../../shared/types'; 
import { gameClient } from "./game_client";
import { renderPongFrame } from './pong_renderer';
import { handleGameOver } from '../renders/game_play';
import { router } from '../../main';
import { navigateTo } from '../services/handle_pong_routes';

// Automatically detects if you are using 'http' or 'https'
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.hostname; 
const port = window.location.port ? window.location.port : (protocol === 'wss' ? '443' : '80');
const gameWSUrl = `${protocol}://${host}:${port}/ws/games/`;

export class WSConnectionsHandler {

	private socket: WebSocket | null = null;

	public isSocketConnected(): boolean { 
        if (!this.socket) return false;
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
		if (this.socket)
			this.socket.send(JSON.stringify(msg));
	}

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
		return new Promise((resolve, reject) => {

			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				resolve(); 
				return;
			}

			if (this.socket)
				reject();

			// Create Socket
			this.socket = new WebSocket(gameWSUrl);

			// Handle Connection Success
			this.socket.onopen = () => {
				this.createAndSendMessages('pong', 'CONNECT', null, null);
				resolve(); // Unblock the await
			};

			// Handle Incoming Messages
			this.socket.onmessage = (event: MessageEvent) => {
				this.handleIncomingMessage(event);
			};

			this.socket.onerror = (error: any) => {
				this.socket = null;
				history.pushState(null, '', `/login?error=${encodeURIComponent('WebSocket Closed')}`);
				router('/login');
				reject(error);
			};
	
			this.socket.onclose = () => {
				this.socket = null;
				history.pushState(null, '', `/login?error=${encodeURIComponent('WebSocket Closed')}`);
				router('/login');
				reject();
			};
		});
	}

	private handleIncomingMessage(event: MessageEvent) {
		try {
			let data: ServerMessage = JSON.parse(event.data as string) as ServerMessage;
			const type: WSMsgType = data.type as WSMsgType;

			// Route the message based on its type
			switch (type) {

				case 'SESSION_READY':
					data = data as PongSessionIsReady;
					gameClient.setGameId(data.payload.sessionId);
					gameClient.setSide('left');
					navigateTo('/games/pong/game-play');
					break ;

				case 'GAME_STATE':
					data = data as PongSessionData;
					if (gameClient.canvas && data.payload) {
						renderPongFrame(gameClient.canvas, data.payload);
					}
					break ;

				case 'GAME_FINISHED':
					data = data as PongSessionData;
					if (gameClient.canvas && data.payload) {
						// Draw the final frame so players see the final score
						renderPongFrame(gameClient.canvas, data.payload);
						// Show the UI Overlay
						handleGameOver(data.payload);
					}
					break ;

				case 'BREAK':
					if (gameClient.canvas && data.payload) {
						renderPongFrame(gameClient.canvas, data.payload);
						handleGameOver(data.payload);
					}
					break ;

				case 'STOP':
					gameClient.reset();
					navigateTo('/home');
					break;
				
				default:
					break ;
			}

		} catch (err) {
			return ;
		}
	}
}
