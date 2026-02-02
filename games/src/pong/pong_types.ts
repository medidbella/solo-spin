

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

	createdAt: number;        // creating time

	timeOut:	number;
	playerStarted: number;
	
	state: GameState;		// ('waiting' | 'playing' | 'finished')
	gameMode: GameMode;		// (local | remote)
	sessionId: string;		// identifies this match
	players: PongPlayer[];		// exactly 2 Player objects (1 per player)
	ball: Ball;				// shared ball objetc instance

	winner: Winner; // the id of the winnere player
	breaker: Breaker;
	stop: boolean;
	timeOuted: boolean;

	nextRoundStartTimestamp: number; // time to start the next round
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