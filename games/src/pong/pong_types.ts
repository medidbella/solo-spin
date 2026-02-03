
import { GameMode, GameState, Winner, Breaker } from '../../../shared/types';

export type Side = 'right' | 'left'
export type PongPlayerState =
    'IDLE'
  | 'WAITING_MATCH'
  | 'READY'
  | 'PLAYING'
  | 'FINISHED';

export interface Ball {
	x: number;
	y: number;

	speed: number; 
    dx: number;    
    dy: number;

	radius: number;	
}
  
export interface Paddle {
	x: number;
	y: number;
}

export interface PlayerInput { 
	up: boolean;
	down: boolean;
}
  
export interface PongPlayer {

	playerId: string;
	
	side: Side;
	paddle: Paddle;
	score: number;
	input: PlayerInput;
	sessiondId: string | null;

}

interface PongSession {

	createdAt: number;
	timeOut:	number;
	playerStarted: number;
	state: GameState;
	gameMode: GameMode;
	sessionId: string;
	players: PongPlayer[];
	ball: Ball;
	winner: Winner;
	breaker: Breaker;
	stop: boolean;
	timeOuted: boolean;
	nextRoundStartTimestamp: number;
	startGameTimeoutChecker?: NodeJS.Timeout;
}

interface GameResult {
	winner_id: string,
	loser_id: string,
	winner_score: number,
	loser_score: number
}

export  {
	GameResult,
	PongSession,
};