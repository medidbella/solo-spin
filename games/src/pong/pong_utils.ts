
import {	PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_START_X_ON_RIGHT,
			PADDLE_START_X_ON_LEFT, PADDLE_START_Y
			, BALL_START_SPEED, BALL_START_X, BALL_START_Y
		} from '../../../shared/pong_constants';

// ------------------------ HTTP ------------------------------------
import { GameMode, HttpSetupResponse, PlayMode } from '../../../shared/types';

function createHttpSuccessResponseBody(gameId: string): HttpSetupResponse {
	const resBody: HttpSetupResponse = {
		status: 'success',
        gameSessionId: gameId,
        message: 'Local game initialized successfully'
	}

	return resBody;
}

function createHttpErrorResponseBody(error: string): HttpSetupResponse {
	const resBody: HttpSetupResponse = {
		status: 'error', 
        error 
	}
	return resBody;
}

export { createHttpSuccessResponseBody, createHttpErrorResponseBody };
// -------------------------------------------------------------------------

// ********************* Pong Player Utils ************************
import { PongPlayer, Paddle, Side, Ball } from './pong_types';

// create Ball:
// Reset ball: After a point, the ball must return to center
function resetBall(ball: Ball, initialSpeed: number): void {
	ball.x = BALL_START_X;
	ball.y = BALL_START_Y;
	// Start moving left or right (deterministic)
	ball.velocityX = Math.random() < 0.5 ? initialSpeed : -initialSpeed;
	ball.velocityY = 0; // straight horizontal start
}

function createBall(): Ball {
	// Create an empty ball object
	const ball: Ball = {
		x: 0,
		y: 0,
		velocityX: 0,
		velocityY: 0,
		radius: 0
	};

	// init the ball
	resetBall(ball, BALL_START_SPEED);
	return ball;
}

// create Paddle"
function resetPaddle(paddle: Paddle, side: Side): void {
	if (side == 'right')
		paddle.x = PADDLE_START_X_ON_RIGHT;
	else 
		paddle.x = PADDLE_START_X_ON_LEFT;

	paddle.y = PADDLE_START_Y;
	paddle.width = PADDLE_WIDTH;
	paddle.height = PADDLE_HEIGHT;
}

function createPaddle(side: Side) {
	// create empty paddle object
	const paddle: Paddle = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};

	// init the Paddle
	resetPaddle(paddle, side);
	return paddle;
}

//  Create Players:
function createPongPlayer(side: Side): PongPlayer {
	// const paddle: Paddle = createPaddle(side);
	const player: PongPlayer = {
		// gameMode,
		// playMode,
		// friendName,
		side,
		paddle: createPaddle(side),
		score: 0,
		input: { up: false, down: false},
	}
	return player;
}

export { createPongPlayer, createBall };