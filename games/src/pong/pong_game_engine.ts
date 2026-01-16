
import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, BALL_RADIUS,
	PADDLE_WIDTH, BALL_MAX_SPEED, BALL_SPEED_INCREASE,
    PADDLE_START_X_ON_LEFT, PADDLE_START_X_ON_RIGHT, PADDLE_START_Y, 
    BALL_START_X, BALL_START_Y, BALL_START_SPEED 
} from '../../../shared/pong_constants';

import { GameMode, PongMoves } from '../../../shared/types';
import { GamesPlayer } from '../game_manager/games_types';
import { getPlayer } from '../game_manager/games_utiles';
import { pongGameSessionsRoom } from './pong_memory';
import { Ball, Paddle, PongPlayer, PongSession } from './pong_types';

class PongEngine {
    
    // --- SINGLETON PATTERN (Optional, but good for consistency) ---
    private static instance: PongEngine;
    private constructor() {} // Private to prevent 'new PongEngine()'

    public static getInstance(): PongEngine {
        if (!PongEngine.instance) {
            PongEngine.instance = new PongEngine();
        }
        return PongEngine.instance;
    }


    /**
     * The Main Processor
     * 1. Finds the game by ID
     * 2. Updates the state based on Inputs
     * 3. Returns the updated session (or null if not found)
     */
    public processGameTick(sessionId: string, playerId: string, gameMode: GameMode, move: PongMoves): PongSession | null {
        
        // 1. Retrieve the specific Game Session from Memory
        const session: PongSession | undefined = pongGameSessionsRoom.getSession(sessionId, gameMode);

        // Safety Check: Does the game exist?
        if (!session || session.state !== 'playing') {
            console.error(`[PongEngine] Game ${sessionId} not active.`);
            return null;
        }

		const player: GamesPlayer | undefined = getPlayer(playerId);
		if (!player || !player.pongPlayer) {
			console.warn(`[PongEngine] Player ${playerId} is not in exist`);
			return null;
		}


        // 2. We will call our sub-methods here
        this.updatePaddles(session, player.pongPlayer, move);
        this.updateBall(session);
        this.checkCollisions(session, player.pongPlayer);

        // 3. Return the modified session so we can send it to clients
        return session;
    }

	// ----------- Helper functions -----------------------
	
    // Helper: Keeps the paddle inside the top/bottom edges
    private clamp(y: number): number {
        const minY = 0;
        const maxY = CANVAS_HEIGHT - PADDLE_HEIGHT;
        return Math.min(Math.max(y, minY), maxY);
    }

	private checkBallCollisions(ball: Ball) {
		// Check Bottom Wall
        if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
            ball.y = CANVAS_HEIGHT - BALL_RADIUS; // Snap back to edge (prevents sticking)
            ball.velocityY *= -1; // Reverse Y direction
        } 
        // Check Top Wall
        else if (ball.y - BALL_RADIUS < 0) {
            ball.y = BALL_RADIUS; // Snap back to edge
            ball.velocityY *= -1; // Reverse Y direction
        }
	}

	private increaseSpeed(ball: Ball) {
        // Cap the speed so it doesn't glitch through walls
        if (Math.abs(ball.velocityX) < BALL_MAX_SPEED) {
            ball.velocityX *= (1 + BALL_SPEED_INCREASE);
            ball.velocityY *= (1 + BALL_SPEED_INCREASE);
        }
    }

	// ------------------------------------------------------

    private updatePaddles(session: PongSession, player: PongPlayer, move: PongMoves): void {

		const speed = PADDLE_SPEED;

		// 1. Identify which paddle belongs to this player
		const Paddle = player.paddle;

		// 2. Apply the Move
        if (move === 'UP') {
            Paddle.y -= speed;
        } else if (move === 'DOWN') {
            Paddle.y += speed;
        }

		// 3. Keep it inside the board (Clamping)
        Paddle.y = this.clamp(Paddle.y);


    }

    private updateBall(session: PongSession): void {
        const ball: Ball = session.ball;

		// 1. Update Position based on current velocity
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
		this.checkBallCollisions(ball);
    }

    private checkCollisions(session: PongSession, player: PongPlayer): void {
        const ball: Ball = session.ball;
		const paddle: Paddle = player.paddle;

		// 1. Define Collision Bounds
        // We check if the Ball's box overlaps with the Paddle's box
        const isColliding = 
            ball.x - BALL_RADIUS < paddle.x + PADDLE_WIDTH && // Ball Left < Paddle Right
            ball.x + BALL_RADIUS > paddle.x &&                // Ball Right > Paddle Left
            ball.y + BALL_RADIUS > paddle.y &&                // Ball Bottom > Paddle Top
            ball.y - BALL_RADIUS < paddle.y + PADDLE_HEIGHT;  // Ball Top < Paddle Bottom

			if (isColliding) {
				// 2. Determine Bounce Direction
				// If ball is moving LEFT (dx < 0), it hit the Left Paddle -> Push Right
				// If ball is moving RIGHT (dx > 0), it hit the Right Paddle -> Push Left
				
				if (ball.velocityX < 0) {
					// Hit Left Paddle
					ball.x = paddle.x + PADDLE_WIDTH + BALL_RADIUS; // Push out to right
					ball.velocityX *= -1; // Reflect
				} 
				else if (ball.velocityX > 0) {
					// Hit Right Paddle
					ball.x = paddle.x - BALL_RADIUS; // Push out to left
					ball.velocityX *= -1; // Reflect
				}
	
				// Optional: Increase speed on hit
				this.increaseSpeed(ball);
			}
    }
}

export { PongEngine };
