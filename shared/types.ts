
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
