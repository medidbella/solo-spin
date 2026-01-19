
// 1. Define the possible "Labels" for your ws messages
export type WSMsgType = 
    | 'CONNECT' 
    | 'CONNECT_SUCCESS' 
    | 'CONNECT_ERROR'
    | 'SELECT_GAME' // Client -> Server (player tells the server which game to play) 
    | 'START_GAME'
    | 'GAME_INPUT'   // Client -> Server (Player did something)
    | 'GAME_STATE'  // Server -> Client (Update the screen)
    | 'GAME_FINISHED';

// 2. Define the Games
export type GameType = 'pong' | 'sudoku';
export type PongInput = 'UP' | 'DOWN' | 'W' | 'S';
export type inputPlayer = 'LEFT' | 'RIGHT';

// --- SYSTEM MESSAGES (Handshake) ---

export interface WSConnectMessage {
    type: 'CONNECT';
    payload: {};
}

// export interface WSConnectSuccess {
//     type: 'CONNECT_SUCCESS';
//     payload: {
//         playerId: string;
//         ready: boolean;
//     };
// }

export interface WSConnectError {
    type: 'CONNECT_ERROR';
    payload: {
        error: string;
    };
}

// --- GAME MESSAGES (The Fun Part) ---

// Selecting a Game
// export interface WSSelectGameMessage {
//     type: 'SELECT_GAME';
//     payload: {
//         game: GameType;
//     }
// }

// export interface WSPongPingMessage {
//     type: 'PING';
//     game: 'pong';
//     payload : {
//         sessionId: string
//     }
// }

export interface WSPongStartGameMessage {
    type: 'START_GAME';
    game: AvailableGames;
    payload : {
        gameId: string
    }
}

// export interface WSPongStartGameSuccess {
//     type: 'START_GAME_SUCCESS';
//     game: 'pong';
//     payload : {
//         sessionId: string
//     }
// }


// A. PONG
export interface WSPongInput {
    type: 'GAME_INPUT';
    game: 'pong';
    payload: {
        gameId: string;
        inputPlayer: inputPlayer; // left/right
        move: PongInput; // Simple directions
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
export type ClientMessage = WSConnectMessage 
                            | WSPongStartGameMessage
                            | WSPongInput | WSSudokuInput
export type ServerMessage = 
                            // WSConnectSuccess |
                            PongSessionData |
                            WSConnectError; // + GameState updates later


// --------- Define the possible "Labels" for your http connections --------

export type AvailableGames = 'pong' | 'sudoku';
export type GameMode = 'local' | 'remote';
export type PlayMode = 'friend' | 'random';
export type GameState = 'waiting' | 'ready' | 'playing' | 'finished';
export type Side = 'left' | 'right';


// ----- HTTP request ---------
export interface HttpPongSetupReq { 
    game: AvailableGames,
    gameMode: GameMode,
    playMode: PlayMode,
    player1: string,
    player2: string,
};

// --- HTTP RESPONSES ---
export interface HttpSetupSuccess {
    status: 'success';
    gameSessionId: string;
    side: Side;
    message: string;
}

export interface HttpSetupError {
    status: 'error';
    error: string;
}

// Union type for the frontend to handle both cases
export type HttpSetupResponse = HttpSetupSuccess | HttpSetupError;


// ----- Client state ---------
export type PlayerState =
    'IDLE'                 // Player created, nothing chosen yet
  | 'GAME_MODE_SELECTED'   // local / remote chosen
  | 'PLAY_MODE_SELECTED'   // friend / random chosen
  | 'FRIEND_NAME_SELECTED' // friend name entered
  | 'WAITING_MATCH'        // waiting for opponent (remote)
  | 'READY'                // fully configured
  | 'PLAYING'              // game loop running
  | 'FINISHED';            // game ended



// -------- WS message between the client and the server ----
// type State = 'waiting' | 'playing' | 'paused' | 'finished';
type Winner = 'player1' | 'player2' | 'none';

export interface PongSessionData {
	// sessionId: string;
    // state: State;

    type: 'GAME_STATE';
    game: 'pong';
    payload: PongPayload
}

// Define the shape of the data we expect
export interface PongPayload {
    leftPlayerName: string;
    rightPlayerName: string;
    leftPaddle: { x: number, y: number };
    rightPaddle: { x: number, y: number };
    ball: { x: number, y: number };
    leftScore: number;
    rightScore: number;
    winner: Winner,
}

