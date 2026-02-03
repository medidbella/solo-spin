
export type WSMsgType = 
	| 'CONNECT' 
	| 'CONNECT_SUCCESS' 
	| 'CONNECT_ERROR'
	| 'SELECT_GAME'
	| 'START_GAME'
	| 'GAME_INPUT'
	| 'GAME_STATE'
	| 'GAME_FINISHED'
	| 'PAUSE'
	| 'RESUME'
	| 'SESSION_READY'
	| 'BREAK'
	| 'STOP'

export type GameType = 'pong' | 'sudoku';
export type PongInput = 'UP' | 'DOWN' | 'W' | 'S';
export type inputPlayer = 'LEFT' | 'RIGHT';

export interface WSConnectMessage {
	type: 'CONNECT';
	payload: {};
}

export interface WSConnectError {
	type: 'CONNECT_ERROR';
	payload: {
		error: string;
	};
}

export interface WSPongStartGameMessage {
	type: 'START_GAME';
	game: AvailableGames;
	payload : {
		gameId: string
	}
}

export interface WSPongPauseMessage {
	type: 'PAUSE';
	game: 'pong';
	payload : {
		sessionId: string
	}
}

export interface WSPongResumeMessage {
	type: 'RESUME';
	game: 'pong';
	payload : {
		sessionId: string
	}
}

export interface WSPongBreakMessage {
	type: 'BREAK';
	game: 'pong';
	payload : {
		sessionId: string
	}
}

export interface WSPongInput {
	type: 'GAME_INPUT';
	game: 'pong';
	payload: {
		gameId: string;
		inputPlayer: inputPlayer;
		move: PongInput;
	};
}

export interface WSSudokuInput {
	type: 'GAME_INPUT';
	game: 'sudoku';
	payload: {
		row: number;
		col: number;
		value: number;
	};
}

export type AvailableGames = 'pong' | 'sudoku';
export type GameMode = 'local' | 'remote';
export type PlayMode = 'friend' | 'random';
export type GameState = 'waiting' | 'ready' | 'playing' | 'PAUSE' | 'finished' | 'break' | 'stop';
export type Side = 'left' | 'right';
export type Breaker = 'p1' | 'p2' | 'none';

export interface HttpPongSetupReq { 
	playerName: string;
	game: AvailableGames,
	gameMode: GameMode,
	playMode: PlayMode,
	player1: string,
	player2: string,
};

export interface HttpSetupSuccess {
	status: 'success' | 'queued';
	gameSessionId: string;
	side: Side;
	message: string;
}

export interface HttpSetupError {
	status: 'error';
	error: string;
}

export type HttpSetupResponse = HttpSetupSuccess | HttpSetupError;

export type PlayerState =
	'IDLE'
  | 'GAME_MODE_SELECTED'
  | 'PLAY_MODE_SELECTED'
  | 'FRIEND_NAME_SELECTED'
  | 'WAITING_MATCH'
  | 'READY'
  | 'PLAYING'
  | 'FINISHED';

export type Winner = 'leftPlayer' | 'rightPlayer' | 'none';

export interface PongSessionData {
	type: 'GAME_STATE' | 'GAME_FINISHED' | 'BREAK';
	game: 'pong';
	payload: PongPayload
}

export interface PongSessionIsReady {
	type: 'SESSION_READY';
	game: 'pong';
	payload: {
		sessionId: string
	};
}

export interface PongSessionStop {
	type: 'STOP';
	game: 'pong';
	payload: {
		sessionId: string
	};
}

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

export type ClientMessage = WSConnectMessage | WSPongStartGameMessage | WSPongInput |
							WSSudokuInput | WSPongPauseMessage | WSPongResumeMessage |
							WSPongBreakMessage
export type ServerMessage = PongSessionData | PongSessionIsReady | PongSessionStop |
							WSConnectError;