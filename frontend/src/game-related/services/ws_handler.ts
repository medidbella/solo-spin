
// import { WebSocket } from 'ws';

// Access the variables using import.meta.env
const port = import.meta.env.VITE_NGINX_PORT;
const host = import.meta.env.VITE_HOST;
const url = `ws://${host}:${port}/ws/games/`;

// import { gameClient } from './game_client';

type pongMoves = 'UP' | 'DOWN' | 'STOP' | 'CONTINUE';

// ---------- SYSTEM MESSAGES (Handshake) ----------------

export interface WSConnectMessage {
	type: 'CONNECT';
	payload: {
		// game: GameType;
		// username: string;
	};
}

export interface WSConnectSuccess {
	type: 'CONNECT_SUCCESS';
	payload: {
		playerId: string;
		ready: boolean;
	};
}

export interface WSConnectError {
	type: 'CONNECT_ERROR';
	payload: {
		error: string;
	};
}
// ----------------------------------------------------

// ---------------- GAME MESSAGES (The Fun Part) ------

// A. PONG
export interface WSPongInput {
	type: 'GAME_INPUT';
	game: 'pong';
	payload: {
		move: pongMoves; // Simple directions
	};
}

// B. SUDOKU (Placeholder for later)
export interface WSSudokuInput {
	type: 'GAME_INPUT';
	game: 'sudoku';
	payload: {
		row: number;
		col: number;
		value: number;
	};
}

type ClientMessage = WSConnectMessage | WSPongInput | WSSudokuInput;
// ---------------------------------------------------------

// ------- WS connections hanlder (send/receive) ------------
class WSConnectionsHandler {

	private socket: WebSocket | null = null;

	private createWSConnectMessage(): ClientMessage {
		const message: ClientMessage = {
			type: 'CONNECT',
			payload: { }
		};

		return message;
	}

	connect() {

		if (this.socket) {
			console.warn("⚠️ Socket already connected");
			return;
		}

		console.log(`🔌 Connecting to ${url}...`);
		this.socket = new WebSocket(url);

		this.socket.onopen = () => {
			console.log('✅ Connection established!');
			const msg = this.createWSConnectMessage();
			// 1. Convert the object to a JSON string
		   // 2. Send it safely (using optional chaining in case socket is null)
			this.socket?.send(JSON.stringify(msg));
		};
	
		this.socket.onerror = (error: any) => {
			console.error('❌ WebSocket error:', error);
		};

		this.socket.onclose = () => {
			console.log('🔌 WebSocket Closed');
			this.socket = null;
	   	};
			
		// Add onmessage here later...
		// We will add methods here later to send data, like:
		// sendMove(x: number) { ... }
	}
}

// ## Export a SINGLE instance ##
export const wsConnectionsHandler = new WSConnectionsHandler();