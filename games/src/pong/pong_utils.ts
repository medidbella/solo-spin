
import { pongEngine } from './pong_memory';
import { GameMode, HttpSetupResponse, PlayMode } from '../../../shared/types';
import { PongPlayer, Paddle, Side, Ball } from './pong_types';

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

function createBall(): Ball {
	const ball: Ball = {
		x: 0,
		y: 0,
		speed: 0,
		dx: 0,
		dy: 0,
		radius: 0
	};

	pongEngine.resetBall(ball);
	return ball;
}

function createPaddle(side: Side) {
	const paddle: Paddle = {
		x: 0,
		y: 0,
	};

	pongEngine.resetPaddle(paddle, side);
	return paddle;
}

function createPongPlayer(playerId: string, side: Side): PongPlayer {
	const player: PongPlayer = {
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

export { createPongPlayer, createBall, storeMatchResult,
	createHttpSuccessResponseBody, createHttpErrorResponseBody
};