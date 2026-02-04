
import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, BALL_RADIUS,
	PADDLE_WIDTH, BALL_MAX_SPEED, BALL_SPEED_INCREASE, WINNING_SCORE,
    PADDLE_START_X_ON_LEFT, PADDLE_START_X_ON_RIGHT, PADDLE_START_Y, 
    BALL_START_X, BALL_START_Y, BALL_START_SPEED, ROUND_START_DELAY_MS
} from '../../../shared/pong_constants';

import { PongInput, PongSessionData, PongSessionIsReady, Winner, PongSessionStop } from '../../../shared/types';
import { playingPlayersRoom } from '../game_manager/games_memory';
import { GamesPlayer } from '../game_manager/games_types';
import { getPlayer } from '../game_manager/games_utiles';
import { pongGameSessionsRoom } from './pong_memory';
import { Ball, Paddle, PongPlayer, PongSession } from './pong_types';

class PongEngine {

    private static instance: PongEngine;
    private constructor() { }

    public static getInstance(): PongEngine {
        if (!PongEngine.instance) {
            PongEngine.instance = new PongEngine();
        }
        return PongEngine.instance;
    }

    public gameTick(session: PongSession): PongSessionData {

        this.updateBall(session);
        this.checkPaddleCollisions(session);
		this.checkScoring(session);

		const resultsMsg: PongSessionData = this.createResutlsMsg(session);

		this.checkGameOver(session, resultsMsg);

        return resultsMsg;
    }

	// ----------- Helper functions -----------------------
	
	public createResutlsMsg(session: PongSession): PongSessionData {

		const player1: GamesPlayer = getPlayer(session.players[0].playerId);
		const player2: GamesPlayer = playingPlayersRoom.get(session.players[1].playerId) as GamesPlayer;
        let leftScore: number;
        let rightScore: number;

		let type: 'GAME_STATE' | 'GAME_FINISHED' | 'BREAK' = 'GAME_STATE';

		if (session.winner != 'none')
			type = 'GAME_FINISHED';

        if (session.breaker != 'none') {
            type = 'BREAK';
            if (session.breaker === 'p1') {
               leftScore = 0;
               rightScore = 5;
               session.winner = 'rightPlayer';
            } else {
                leftScore = 5;
                rightScore = 0;
                session.winner = 'leftPlayer';
            }
        } else {
            leftScore = player1.pongPlayer!.score as number;
			rightScore = player2.pongPlayer!.score as number;
        }

		const resultsMsg: PongSessionData = {
			type,
    		game: 'pong',

			payload: {
				
				leftPlayerName: player1.playerName,
				rightPlayerName: player2.playerName,

				leftPaddle: {
					x: player1.pongPlayer?.paddle.x as number,
					y: player1.pongPlayer?.paddle.y as number
				},

				rightPaddle: {
					x: player2.pongPlayer?.paddle.x as number,
					y: player2.pongPlayer?.paddle.y as number
				},

				ball: {
					x: session.ball.x,
					y: session.ball.y
				},

				leftScore,
				rightScore,

				winner: session.winner
			}

		}
		return resultsMsg;
	}

    public createWSMatchIsReadyMessage(sessionId: string): PongSessionIsReady {
        const msg: PongSessionIsReady = {
            type: 'SESSION_READY',
            game: 'pong',
            payload: {
                sessionId
            }
        }
        return msg
    }

    public  createStopGameMsg(sessionId: string): PongSessionStop {
        const msg: PongSessionStop = {
            type: 'STOP',
            game: 'pong',
            payload: {
                sessionId
            }
        }
        return msg;
    }
    

    // Keeps the paddle inside the top/bottom edges
    private clamp(y: number): number {
        const minY = 0;
        const maxY = CANVAS_HEIGHT - PADDLE_HEIGHT;
        return Math.min(Math.max(y, minY), maxY);
    }

	// hablde if ball hits the wall
	private checkBallCollisions(ball: Ball) {

		// Check Bottom Wall
        if (ball.y + ball.radius > CANVAS_HEIGHT) {
            ball.y = CANVAS_HEIGHT - ball.radius;
            ball.dy *= -1;
        }

        // Check Top Wall
		else if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.dy *= -1;
        }
	}

	// Speed updating 
    private adjustSpeed(ball: Ball): void {
        if (ball.speed < BALL_MAX_SPEED) {
            ball.speed += BALL_SPEED_INCREASE;
        }
	}

	public resetPaddle(paddle: Paddle, side: 'left' | 'right'): void {
        paddle.y = PADDLE_START_Y;

        if (side === 'left') {
            paddle.x = PADDLE_START_X_ON_LEFT;
        } else {
            paddle.x = PADDLE_START_X_ON_RIGHT;
        }
	}

    public resetBall(ball: Ball): void {
        
        ball.x = BALL_START_X;
        ball.y = BALL_START_Y;
        
        ball.speed = BALL_START_SPEED;

        ball.dx = Math.random() > 0.5 ? 1 : -1;
        ball.dy = Math.random() > 0.5 ? 1 : -1;
    }

    private checkWinner(session: PongSession): boolean {

		const player1: PongPlayer = session.players[0];
		const player2: PongPlayer = session.players[1];

		// player 1:
        if (player1.score >= WINNING_SCORE) {
            session.winner = 'leftPlayer';
            session.state = 'finished';
            return true;
        }
        
        if (player2.score >= WINNING_SCORE) {
            session.winner = 'rightPlayer';
            session.state = 'finished';
            return true;
        }

        return false; // Game continues
    }

	// handle if someone scores
    private handleScoreEvent(session: PongSession): boolean {

        if (this.checkWinner(session)) {
			return true; 
        }

        this.resetBall(session.ball);

        session.nextRoundStartTimestamp = Date.now() + ROUND_START_DELAY_MS;
		
		return false;
    }

	private getWinner(leftScore: number, rightScore: number): Winner {
		return leftScore > rightScore ? 'leftPlayer' : 'rightPlayer';
	}

    public updatePaddles(session: PongSession, player: PongPlayer, move: PongInput): void {

		const speed = PADDLE_SPEED;

		const paddle = player.paddle;

        if (move === 'UP' || move === 'W') {
            paddle.y -= speed;
        } else if (move === 'DOWN' || move === 'S') {
            paddle.y += speed;
        }

        paddle.y = this.clamp(paddle.y);
    }

    private updateBall(session: PongSession): void {

		const ball: Ball = session.ball;
		
        if ( session.nextRoundStartTimestamp && Date.now() < session.nextRoundStartTimestamp) {
            return; 
        } else if (session.nextRoundStartTimestamp)
			session.nextRoundStartTimestamp = 0;

		ball.x += (ball.dx * ball.speed);
    	ball.y += (ball.dy * ball.speed);
		this.checkBallCollisions(ball);

    }

    private checkPaddleCollisions(session: PongSession): void {
        const ball: Ball = session.ball;
		const paddle1: Paddle = session.players[0].paddle;
		const paddle2: Paddle = session.players[1].paddle;

		// Check Left Paddle (Player 1)
        // Logic: is the Ball inside the paddle's box ?
		if (ball.x - ball.radius <= paddle1.x + PADDLE_WIDTH && // Ball Left hit Paddle Right
            ball.x + ball.radius >= paddle1.x &&                 // Ball Right inside Paddle
            ball.y + ball.radius >= paddle1.y &&                 // Ball Bottom hit Paddle Top
            ball.y - ball.radius <= paddle1.y + PADDLE_HEIGHT) { // Ball Top hit Paddle Bottom

            ball.dx = 1;
            ball.x = paddle1.x + PADDLE_WIDTH + ball.radius + 1;
            this.adjustSpeed(ball);
            // console.log(`  [NEW SPEED]:  ${ball.speed}`);
		}

		// Check Right Paddle (Player 2)
        else if (ball.x + ball.radius >= paddle2.x &&
			ball.x - ball.radius <= paddle2.x + PADDLE_WIDTH && 
			ball.y + ball.radius >= paddle2.y && 
			ball.y - ball.radius <= paddle2.y + PADDLE_HEIGHT) {

            ball.dx = -1;
            ball.x = paddle2.x - ball.radius - 1;
            this.adjustSpeed(ball);
            // console.log(`  [NEW SPEED]:  ${ball.speed}`);
		}
    }

	private checkScoring(session: PongSession): void {
		const ball: Ball = session.ball;
		const leftPlayer: PongPlayer = session.players[0];
		const rightPlayer: PongPlayer = session.players[1];
		
		// If Ball passed Left Wall (Right Player Scores)
        if (ball.x + ball.radius < 0) {
            rightPlayer.score++;
            if (this.handleScoreEvent(session)) {
				session.winner = this.getWinner(leftPlayer.score, rightPlayer.score);
			}
        }

		// If Ball passed Right Wall (Left Player Scores)
        else if (ball.x - ball.radius > CANVAS_WIDTH) {
            leftPlayer.score++;
            if (this.handleScoreEvent(session)) {
				session.winner = this.getWinner(leftPlayer.score, rightPlayer.score);
			}
        }
	}

	// check if game over & handle
	private checkGameOver(session: PongSession, results: PongSessionData) {
		if (session.winner != 'none')
			pongGameSessionsRoom.endGame(session.sessionId, session.gameMode);
	}
}

export { PongEngine };
