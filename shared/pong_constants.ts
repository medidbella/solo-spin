// World rules
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
// const TARGET_FPS = 60;
// export const FRAME_TIME_MS = 1000 / TARGET_FPS;


// Paddle rules
export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 100;
export const PADDLE_SPEED = 8;
export const PADDLE_MARGIN = 10;
export const PADDLE_START_Y = (CANVAS_HEIGHT / 2) - (PADDLE_HEIGHT / 2);
export const PADDLE_START_X_ON_LEFT = PADDLE_MARGIN
export const PADDLE_START_X_ON_RIGHT = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;

// Ball rules
export const BALL_RADIUS = 8;
export const BALL_START_SPEED = 3;
export const BALL_MAX_SPEED = 9
export const BALL_SPEED_INCREASE = 0.25; // Ball gets faster after every hit;
export const BALL_START_X = CANVAS_WIDTH / 2;
export const BALL_START_Y = CANVAS_HEIGHT / 2;


// game rules
export const WINNING_SCORE = 5;
export const ROUND_START_DELAY_MS = 1000;
export const GAME_STATE_UPDATE_INTERVAL_MS = 15 //1000/100
// export const GAME_STATE_UPDATE_INTERVAL_MS = 1000 //1000/100

export const PINGTIMEOUT = 3000;
export const STARTGAMETIMEOUT = 15000;

export const REMOVESESSIONDELAY = 10000;
export const DELETEPLAYERTIMEOUT = 1500;