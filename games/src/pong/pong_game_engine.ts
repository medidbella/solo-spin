
import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, BALL_RADIUS,
	PADDLE_WIDTH, BALL_MAX_SPEED, BALL_SPEED_INCREASE, WINNING_SCORE,
    PADDLE_START_X_ON_LEFT, PADDLE_START_X_ON_RIGHT, PADDLE_START_Y, 
    BALL_START_X, BALL_START_Y, BALL_START_SPEED, ROUND_START_DELAY_MS
} from '../../../shared/pong_constants';

import { PongInput, PongSessionData, PongSessionIsReady, Winner } from '../../../shared/types';
import { playingPlayersRoom } from '../game_manager/games_memory';
import { GamesPlayer } from '../game_manager/games_types';
import { getPlayer } from '../game_manager/games_utiles';
import { pongGameSessionsRoom } from './pong_memory';
import { Ball, Paddle, PongPlayer, PongSession } from './pong_types';

class PongEngine {

    // --- SINGLETON PATTERN (Optional, but good for consistency) ---
    private static instance: PongEngine;
    private constructor() { }

    public static getInstance(): PongEngine {
        if (!PongEngine.instance) {
            PongEngine.instance = new PongEngine();
        }
        return PongEngine.instance;
    }

    public gameTick(session: PongSession): PongSessionData {
		let winner: Winner = 'none';
        
        // // 1. Retrieve the specific Game Session from Memory
        // const session: PongSession | undefined = pongGameSessionsRoom.getSession(sessionId, gameMode);

        // // Safety Check: Does the game exist?
        // if (!session || session.state !== 'playing') {
        //     console.error(`[PongEngine] Game ${sessionId} not active.`);
        //     return null;
        // }

        // 2. all sub-methods here
        // this.updatePaddles(session, player.pongPlayer, move); // will be called only if player moves
        this.updateBall(session);
        this.checkPaddleCollisions(session);
		this.checkScoring(session);       // Check Goal/Game Over
		
		// console.log("  ==>> Updated States here <<== ");
		
        // 3. Return the results (new coordinates, score, winner) that will send to clients
		const resultsMsg: PongSessionData = this.createResutlsMsg(session);

		// 4. end the game
		this.checkGameOver(session, resultsMsg);

        return resultsMsg;
    }

	// ----------- Helper functions -----------------------
	
	// create the results msg
	private createResutlsMsg(session: PongSession): PongSessionData {

		const player1: GamesPlayer = getPlayer(session.players[0].playerId);
		const player2: GamesPlayer = playingPlayersRoom.get(session.players[1].playerId) as GamesPlayer;

        // console.log(" -------------- PLAYER 1 ----------------- ");

        // if (player1) {

        //     if (player1.playerName)
        //         console.log(`   ## player 1 name: ${player1.playerName} ##`);
        //     else
        //         console.log(" ## player 1 name is not set ##");
        // } else {
        //     console.log("  ## Player 1 is not exist ##");
        // }

        // console.log(" ------------------------------- ");

        // console.log(" -------------- PLAYER 2 ----------------- ");

        // if (player2) {

        //     if (player2.playerName)
        //         console.log(`   ## player 2 name: ${player2.playerName} ##`);
        //     else
        //         console.log(" ## player 2 name is not set ##");
        // } else {
        //     console.log("  ## Player 2 is not exist ##");
        // }

        // console.log(" ------------------------------- ");

		let type: 'GAME_STATE' | 'GAME_FINISHED' = 'GAME_STATE';

		// update state: game is finished
		if (session.winner != 'none')
			type = 'GAME_FINISHED';

		const resultsMsg: PongSessionData = {
			type,
    		game: 'pong',

			payload: {
				
				leftPlayerName: player1.playerName,
				rightPlayerName: player2.playerName,
				// rightPlayerName: player1.concurrentId as string,

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

				leftScore: player1.pongPlayer?.score as number,
				rightScore: player2.pongPlayer?.score as number,

				winner: session.winner
			}

		}
		return resultsMsg;
	}

    // create Match Ready Message
    public createWSMatchIsReadyMessage(sessionId: string) {
        const msg: PongSessionIsReady = {
            type: 'SESSION_READY',
            game: 'pong',
            payload: {
                sessionId
            }
        }
        return msg
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
            ball.y = CANVAS_HEIGHT - ball.radius; // Snap back to edge
            ball.dy *= -1; // Reverse Direction (Flip 1 to -1)
        }

        // Check Top Wall
		else if (ball.y - ball.radius < 0) {
            ball.y = ball.radius; // Snap back to edge
            ball.dy *= -1; // Reverse Direction
        }
	}

	// Speed updating 
    private adjustSpeed(ball: Ball): void {
        ball.speed += BALL_SPEED_INCREASE;

        // Reset to start speed if it gets too fast
        if (ball.speed >= BALL_MAX_SPEED) {
            ball.speed = BALL_START_SPEED;
        }
	}

	// Reset Paddle for next round
	public resetPaddle(paddle: Paddle, side: 'left' | 'right'): void {
		// Reset Vertical Position (Center)
        paddle.y = PADDLE_START_Y;

		// Reset Horizontal Position (Just in case it drifted)
        if (side === 'left') {
            paddle.x = PADDLE_START_X_ON_LEFT;
        } else {
            paddle.x = PADDLE_START_X_ON_RIGHT;
        }
	}

	// Reset Ball for next round
    public resetBall(ball: Ball): void {
        // const { ball } = session;
        
        // Center Position
        ball.x = BALL_START_X;
        ball.y = BALL_START_Y;
        
        // Reset Speed
        ball.speed = BALL_START_SPEED;

        // Randomize Direction (Serve)
        // 50/50 chance for Left/Right and Up/Down
        ball.dx = Math.random() > 0.5 ? 1 : -1;
        ball.dy = Math.random() > 0.5 ? 1 : -1;
    }

	// Check if Game Over
    private checkWinner(session: PongSession): boolean {

		const player1: PongPlayer = session.players[0];
		const player2: PongPlayer = session.players[1];

		// player 1:
        if (player1.score >= WINNING_SCORE) {
            session.winner = 'leftPlayer'; // Player 1 Wins
            session.state = 'finished'; // Stop the game loop
            return true;
        }
        
        if (player2.score >= WINNING_SCORE) {
            session.winner = 'rightPlayer'; // Player 2 Wins
            session.state = 'finished';
            return true;
        }

        return false; // Game continues
    }

	// handle if someone scores
    private handleScoreEvent(session: PongSession): boolean { // return true if the game has a winner (finished)
        // 1. Check if the game ended
        if (this.checkWinner(session)) {
            // Game Over, don't reset ball (game has a winner)
			return true; 
        }

        // 2. If game continues, put ball & Paddle back in center
        this.resetBall(session.ball);
		// 3. SET THE DELAY (e.g., 1000ms = 1 second)
        // The ball will freeze until this time passes
        session.nextRoundStartTimestamp = Date.now() + ROUND_START_DELAY_MS;
		
		return false; // game continues (no winner yet)
    }

	private getWinner(leftScore: number, rightScore: number): Winner {
		return leftScore > rightScore ? 'leftPlayer' : 'rightPlayer';
	}

	// ------------------------------------------------------

    public updatePaddles(session: PongSession, player: PongPlayer, move: PongInput): void {

		const speed = PADDLE_SPEED;

		// 1. Identify which paddle belongs to this player
		const paddle = player.paddle;

		// 2. Apply the Move
        if (move === 'UP' || move === 'W') {
            paddle.y -= speed;
        } else if (move === 'DOWN' || move === 'S') {
            paddle.y += speed;
        }

		// 3. Keep it inside the board (Clamping)
        paddle.y = this.clamp(paddle.y);
    }

    private updateBall(session: PongSession): void {

		const ball: Ball = session.ball;
		
		// 2. Check for Delay
        // If current time is less than the start time, freeze the ball logic!
        if ( session.nextRoundStartTimestamp && Date.now() < session.nextRoundStartTimestamp) {
            return; 
        } else if (session.nextRoundStartTimestamp)
			session.nextRoundStartTimestamp = 0;

		// 1. Update Position based on current velocity
		ball.x += (ball.dx * ball.speed);
    	ball.y += (ball.dy * ball.speed);
		this.checkBallCollisions(ball);

    }

    private checkPaddleCollisions(session: PongSession): void {
        const ball: Ball = session.ball;
		const paddle1: Paddle = session.players[0].paddle;
		const paddle2: Paddle = session.players[1].paddle;

		// --- 1. Check Left Paddle (Player 1) ---
        // Logic: is the Ball inside the paddle's box ???
		if (ball.x - ball.radius <= paddle1.x + PADDLE_WIDTH && // Ball Left hit Paddle Right
            ball.x + ball.radius >= paddle1.x &&                 // Ball Right inside Paddle
            ball.y + ball.radius >= paddle1.y &&                 // Ball Bottom hit Paddle Top
            ball.y - ball.radius <= paddle1.y + PADDLE_HEIGHT) { // Ball Top hit Paddle Bottom
		
			// 1. Force Direction: Right
            ball.dx = 1;

			// 2. Fix Position
            ball.x = paddle1.x + PADDLE_WIDTH + ball.radius + 1;

			// 3. Increase Speed
            this.adjustSpeed(ball);
		}

		// --- 2. Check Right Paddle (Player 2) ---
		// Logic: is the Ball inside the paddle's box ???
        else if (ball.x + ball.radius >= paddle2.x &&           // Ball Right hit Paddle Left
			ball.x - ball.radius <= paddle2.x + PADDLE_WIDTH && 
			ball.y + ball.radius >= paddle2.y && 
			ball.y - ball.radius <= paddle2.y + PADDLE_HEIGHT) {

			// 1. Force Direction: Left
            ball.dx = -1;

			// 2. Fix Position
            ball.x = paddle2.x - ball.radius - 1;

			// 3. Increase Speed
            this.adjustSpeed(ball);
			
		}
    }

	private checkScoring(session: PongSession): void {
		const ball: Ball = session.ball;
		const leftPlayer: PongPlayer = session.players[0];
		const rightPlayer: PongPlayer = session.players[1];
		// let winner: Winner = 'none';
		
		// --- Case A: Ball passed Left Wall (Right Player Scores) ---
        if (ball.x + ball.radius < 0) {
            rightPlayer.score++; // Add point to Right Player (player 2)
            if (this.handleScoreEvent(session)) {
				session.winner = this.getWinner(leftPlayer.score, rightPlayer.score);
			}
        }

		// --- Case B: Ball passed Right Wall (Left Player Scores) ---
        else if (ball.x - ball.radius > CANVAS_WIDTH) {
            leftPlayer.score++; // Add point to Left Player (player 1)
            if (this.handleScoreEvent(session)) {
				session.winner = this.getWinner(leftPlayer.score, rightPlayer.score);
			}
        }
	}

	// check if game over & handle
	private checkGameOver(session: PongSession, results: PongSessionData) {
		if (session.winner != 'none')
			// end the game: cleanup the session in the game engine
			pongGameSessionsRoom.endGame(session.sessionId, session.gameMode);
	}
}

export { PongEngine };
