
// import {	PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_START_X_ON_RIGHT,
// 			PADDLE_START_X_ON_LEFT, PADDLE_START_Y
// 			, BALL_START_SPEED, BALL_START_X, BALL_START_Y
// 		} from '../../../shared/pong_constants';

import { pongEngine } from './pong_memory';

// ------------------------ HTTP ------------------------------------
import { GameMode, HttpSetupResponse, PlayMode } from '../../../shared/types';

function createHttpSuccessResponseBody(gameId: string, side: Side, gameMode: GameMode): HttpSetupResponse {

	let message: string;
	let status: 'success' | 'queued' = 'success';

	if (gameMode == 'local')
		message = 'Local game initialized successfully';
	else {
		if (side == 'right')
			message = 'Remote game initialized successfully';
		else {
			message = 'Added to matchmaking queue';
			status = 'queued';
		}
	}

	const resBody: HttpSetupResponse = {
		status,
        gameSessionId: gameId,
		side,
        message
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

function createBall(): Ball {
	// Create an empty ball object
	const ball: Ball = {
		x: 0,
		y: 0,
		speed: 0,
		dx: 0,
		dy: 0,
		radius: 0
	};

	// init the ball
	pongEngine.resetBall(ball);
	return ball;
}

function createPaddle(side: Side) {
	// create empty paddle object
	const paddle: Paddle = {
		x: 0,
		y: 0,
		// width: 0,
		// height: 0
	};

	// init the Paddle
	pongEngine.resetPaddle(paddle, side);
	return paddle;
}

//  Create Players:
function createPongPlayer(playerId: string, side: Side): PongPlayer {
	// const paddle: Paddle = createPaddle(side);
	const player: PongPlayer = {
		// gameMode,
		// playMode,
		// friendName,
		playerId,
		side,
		paddle: createPaddle(side),
		score: 0,
		input: { up: false, down: false},
		sessiondId: null
	}
	return player;
}


async function storeMatchResult(jsonGameResult: any): Promise<any> {
	const serverPrefx = process.env.NODE_ENV == "deployment" ? "internal" : "api" 

	const res = await fetch(`http://backend:3000/${serverPrefx}/games`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			   'x-internal-secret': process.env.INTERNAL_API_SECRET || 'non'
		},
		body: jsonGameResult
	})

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`HTTP Error ${res.status}: ${errorText}`);
	}

	const data = await res.json();
	console.log("✅ [Storage] Game saved successfully:", data);
	return data;

}

export { createPongPlayer, createBall, storeMatchResult };