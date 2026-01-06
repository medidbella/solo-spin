import { Side, Ball, Paddle, Player, GameMode, PlayMode, GameSession
			, PongGameConfig, GameConstants, LocalGameSession
		} from './types';

import { CANVAS_HEIGHT, CANVAS_WIDTH,
			BALL_START_X, BALL_START_Y, BALL_START_SPEED, BALL_RADIUS,
			PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_START_X_ON_RIGHT, 
			PADDLE_START_X_ON_LEFT, PADDLE_START_Y
		} from './constants';

import { defaultPlayerState, onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom,
			remoteGamesRoom, localGamesRoom
	} from './memory';


// ************************************  Gameplay Utils ***********************************

// Clamp paddle position: Prevents paddle from moving outside the canvas
function clamp(value: number, min: number, max: number): number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}
// Usage example: {paddle.y = clamp(paddle.y, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);}


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

// Detect collision between ball and paddle: Ensures the ball bounces when hitting a paddle
function isColliding(ball: Ball, paddle: Paddle): boolean {
	return (
		ball.x - ball.radius < paddle.x + paddle.width &&
		ball.x + ball.radius > paddle.x &&
		ball.y - ball.radius < paddle.y + paddle.height &&
		ball.y + ball.radius > paddle.y
	);
}


// score/bounds:
// * Check if ball hits top/bottom wall:
function hitWall(ball: Ball): boolean {
	return ball.y - ball.radius <= 0 || ball.y + ball.radius >= CANVAS_HEIGHT;
}

// * Reverse ball vertical direction if it hits wall:
function bounceY(ball: Ball): void {
	ball.velocityY *= -1;
}

// ************************************  Player Utils ***********************************

function getOnlinePlayerById(playerId: string): Player | undefined {
	return onlinePlayersRooom.get(playerId);
}

function setGameMode(playerId: string, gameMode: GameMode) {

	const player =  getOnlinePlayerById(playerId);
	player!.gameMode = gameMode;
	player!.playerState = 'GAME_MODE_SELECTED';

	// const player: Player = players[playerID];

	// player.gameMode = gameMode;
	// player.playerState = 'GAME_MODE_SELECTED';
}

function setPlayMode(playerId: string, playMode: PlayMode) {

	const player = getOnlinePlayerById(playerId);
	player!.playMode = playMode;
	player!.playerState = 'PLAY_MODE_SELECTED';

	// const player: Player = players[playerID];

	// player.playMode = playMode;
	// player.playerState = 'PLAY_MODE_SELECTED';
}

function setFriendName(playerId: string, friendName: string) {

	const player = getOnlinePlayerById(playerId);
	player!.friendName = friendName;
	player!.playerState = 'FRIEND_NAME_SELECTED';

	// const player: Player = players[playerID];

	// player.friendName = friendName;
	// player.playerState = 'FRIEND_NAME_SELECTED';
}

// add client to Record player objects
// function addPlayerObject(_name: string, _id: string): void {
// 	const newPlayer: Player = { name: _name, id: _id, playerState: defaultPlayerState };
// 	players[_id] = newPlayer
// }

// function playerIdResolver(playerName: string): string | null {
	
// 	return Object.keys(players).find(
//         id => players[id].name === playerName
//     ) || null;
// }

// function getPlayer(playerId: string): Player {
// 	const player: Player = players[playerId];
// 	delete players[playerId];

// 	return player;
// }

// function createLocalFriendPlayer(name: string, position: Position): Player {

// 	// // create empty paddle object
// 	// const paddle: Paddle = {
// 	// 	x: 0,
// 	// 	y: 0,
// 	// 	width: 0,
// 	// 	height: 0
// 	// };

// 	// resetPaddle(paddle, position);

// 	const paddle: Paddle = createPaddle(position);

// 	const friendPlayer: Player = {
// 		name: name,
// 		playerState: 'WAITING_MATCH',
// 		gameMode: 'local',
// 		playMode: 'friend',
// 		paddle: paddle,
// 		score: 0,
// 	}
// 	return friendPlayer;
// }

// ----------------------- Create Players -----------------------
function createPlayer(playerId: string, name: string): Player {
	// const paddle: Paddle = createPaddle(side);
	const player: Player = {
		id: playerId,
		name,
		playerState: "INIT",
		// paddle,
		score: 0,
		input: { up: false, down: false},
		// side
	}
	return player;
}

function createLocalPlayer(playerName: string) {
	// const paddle: Paddle = createPaddle(side);
	const player: Player = {
		name: playerName,
		playerState: "READY",
		// paddle,
		score: 0,
		input: { up: false, down: false},
		// side
	}
	return player;
}

// function initPlayer() {

// }

function getLocalGameSession(sessionId: string): GameSession | undefined {
	return localGamesRoom.get(sessionId);
}

function getRemoteGameSession(sessionId: string) {
	return remoteGamesRoom.get(sessionId);
}

function getGameSessionId(sessionId: string) {
	const session: GameSession | undefined = getLocalGameSession(sessionId);
	if (session)
		return session;
	else
		return getRemoteGameSession(sessionId);
}

function createGameSession(sessionId: string, gameMode: GameMode, players: Player[]): GameSession {
	const gameSession: GameSession = {
		createdAt: Date.now(),
		state: 'waiting',
		gameMode,
		sessionId,
		players,
		ball: createBall()
	}
	return gameSession;
}

  
// export function attachSocketToSession(
// 	sessionId: string,
// 	socket: WebSocket
// ) {
// 	const session = localGames.get(sessionId);
// 	if (!session) return null;
  
// 	session.socket = socket;
// 	return session;
//   }
  
//   export function deleteLocalGameSession(sessionId: string) {
// 	localGames.delete(sessionId);
//   }


function createOnlinePlayer(playerId: string, playerName: string) {
	// create new player: add id & name only!!
	const newOnlinePlayer: Player = createPlayer(playerId, playerName);
	onlinePlayersRooom.set(playerId, newOnlinePlayer);

	// add it to availabe player room
	availablePlayersRoom.set(playerId, newOnlinePlayer);
}

function addPlayerToPlayingRoom(playerId: string) {
	const playingPlayer: Player | undefined = availablePlayersRoom.get(playerId);
	availablePlayersRoom.delete(playerId);

	if (playingPlayer) {
		playingPlayersRoom.set(playerId, playingPlayer);
	}
}

function addPlayerToAvailablePlayersRoom(playerId: string) {
	const availabePlayer: Player | undefined = playingPlayersRoom.get(playerId);
	playingPlayersRoom.delete(playerId);

	if (availabePlayer) {
		availablePlayersRoom.set(playerId, availabePlayer);
	}
}

function addGameSessionToLocalGamesRoom(localGameSession: GameSession) {
	localGamesRoom.set(localGameSession.sessionId as string, localGameSession);
}

function deleteGameSessionFromLocalGamesRoom(localGameSessionId: string) {
	localGamesRoom.delete(localGameSessionId);
}

function setPlayerGameSessionId(playerId: string, sessionId: string) {
	getOnlinePlayerById(playerId)!.gameSessionId = sessionId;
}

function createSessionConfig(playerId: string) {

	const player: Player = getOnlinePlayerById(playerId) as Player;

	const gameConstants: GameConstants = {
		CANVAS_WIDTH,
		CANVAS_HEIGHT,
		PADDLE_WIDTH,
		PADDLE_HEIGHT,
		BALL_RADIUS,
	};

	const gameSessionConfig: PongGameConfig = {
		gameConstants,
		sessionId: player.gameSessionId as string,
		player1: player.name as string,
		player2: player.friendName as string
	};

	return gameSessionConfig;
}

export { clamp, resetBall, createBall, resetPaddle, createPaddle, isColliding, hitWall, bounceY,
			createPlayer, setGameMode, setPlayMode, setFriendName,
			createOnlinePlayer, addPlayerToPlayingRoom, addPlayerToAvailablePlayersRoom,
			getOnlinePlayerById, createLocalPlayer, createGameSession, addGameSessionToLocalGamesRoom,
			deleteGameSessionFromLocalGamesRoom, setPlayerGameSessionId, createSessionConfig
			// playerIdResolver, getPlayer, addPlayerObject, getGameSession
		};