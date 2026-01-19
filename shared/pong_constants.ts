// World rules
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;


// Paddle rules
export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 100;
export const PADDLE_SPEED = 20;
export const PADDLE_MARGIN = 10;
export const PADDLE_START_Y = (CANVAS_HEIGHT / 2) - (PADDLE_HEIGHT / 2);
export const PADDLE_START_X_ON_LEFT = PADDLE_MARGIN
export const PADDLE_START_X_ON_RIGHT = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;

// Ball rules
export const BALL_RADIUS = 8;
export const BALL_START_SPEED = 5;
export const BALL_MAX_SPEED = 9
export const BALL_SPEED_INCREASE = 0.5; // Ball gets faster after every hit;
export const BALL_START_X = CANVAS_WIDTH / 2;
export const BALL_START_Y = CANVAS_HEIGHT / 2;


// game rules
export const WINNING_SCORE = 20;
