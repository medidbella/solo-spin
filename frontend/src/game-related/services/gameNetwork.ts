

// 1. Define the possible "Labels" for your messages
export type WSMsgType = 
    | 'CONNECT' 
    | 'CONNECT_SUCCESS' 
    | 'CONNECT_ERROR' 
    | 'GAME_INPUT'   // Client -> Server (Player did something)
    | 'GAME_STATE';  // Server -> Client (Update the screen)

// 2. Define the Games
export type GameType = 'pong' | 'sudoku';
export type pongMoves = 'UP' | 'DOWN' | 'STOP' | 'CONTINUE';

// --- SYSTEM MESSAGES (Handshake) ---

export interface WSConnectMessage {
    type: 'CONNECT';
    payload: {
        game: GameType;
        username: string;
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

// --- GAME MESSAGES (The Fun Part) ---

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

// 3. The Master Type (The Union)
// This is what you use in your socket.onmessage function!
export type ClientMessage = WSConnectMessage | WSPongInput | WSSudokuInput;
export type ServerMessage = WSConnectSuccess | WSConnectError; // + GameState updates later


// Access the variables using import.meta.env
const port = import.meta.env.VITE_NGINX_PORT;
const host = import.meta.env.VITE_HOST;
const url = `ws://${host}:${port}/ws/games/`;

// import { ClientMessage  } from "@shared/types";

class GameNetwork {
    private socket: WebSocket | null = null;

    private createWSConnectMessage(): ClientMessage {
        const message: ClientMessage = {
            type: 'CONNECT',
            payload: {
                game: 'pong',       // Or a variable like this.gameType
                username: 'Player1' // Or a variable like this.username
            }
        };

        return message;
    }

    connect() {
        console.log(`🔌 Attempting to connect to ${url}...`);
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('✅ Connection established!');
            const message: ClientMessage = this.createWSConnectMessage();
            // 1. Convert the object to a JSON string
            // 2. Send it safely (using optional chaining in case socket is null)
            this.socket?.send(JSON.stringify(message));

        };

        this.socket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };
        
        // Add onmessage here later...
    }
    
    // We will add methods here later to send data, like:
    // sendMove(x: number) { ... }
}

// 🌟 THE KEY STEP: Export a SINGLE instance 🌟
export const gameSocket = new GameNetwork();