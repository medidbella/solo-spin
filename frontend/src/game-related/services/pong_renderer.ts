

import { 
	CANVAS_WIDTH, CANVAS_HEIGHT, 
	PADDLE_WIDTH, PADDLE_HEIGHT, 
	BALL_RADIUS 
} from './pong_constants';

type Scale = {
    scaleX: number;
    scaleY: number;
};

type Paddle = {
    x: number;
    y: number;
};

type Ball = {
    x: number;
    y: number;
};

// Calcule Scale
function calculateScale(canvas: HTMLCanvasElement): Scale {
	const scaleX = canvas.width / CANVAS_WIDTH;
    const scaleY = canvas.height / CANVAS_HEIGHT;

	return {scaleX, scaleY};
}

// Draw Net
function drawNet(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: Scale) {
	ctx.beginPath();
    ctx.setLineDash([10 * scale.scaleY, 15 * scale.scaleY]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2 * scale.scaleX;
    ctx.stroke();
    ctx.setLineDash([]); // Reset
}

// Draw Paddle
function drawPaddle(ctx: CanvasRenderingContext2D, fillStyle: string | CanvasGradient | CanvasPattern, paddle: Paddle, scale: Scale) {
	ctx.fillStyle = fillStyle; 
    ctx.fillRect(
        paddle.x * scale.scaleX,
        paddle.y * scale.scaleY,
        PADDLE_WIDTH * scale.scaleX,
        PADDLE_HEIGHT * scale.scaleY
    );
}

// Draw Ball
function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, fillStyle: string | CanvasGradient | CanvasPattern, scale: Scale) {
	ctx.beginPath();
    ctx.arc(
        ball.x * scale.scaleX,
        ball.y * scale.scaleY,
        BALL_RADIUS * scale.scaleX,
        0, 
        Math.PI * 2
    );
    ctx.fillStyle = fillStyle;
    ctx.fill();
}

export function renderPongFrame(canvas: HTMLCanvasElement, data: any) {
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

	const scale: Scale = calculateScale(canvas);

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- DRAWING THE GAME BOARD ---

    // Draw Net (Center Line)
	drawNet(canvas, ctx, scale);

    // Draw Left Paddle (Purple)
	let fillStyle: string | CanvasGradient | CanvasPattern = "#a855f7";
	drawPaddle(ctx, fillStyle, data.leftPaddle, scale);

    // Draw Right Paddle (Blue)
	fillStyle = "#3b82f6";
	drawPaddle(ctx, fillStyle, data.rightPaddle, scale);

    // Draw Ball if Game Not Over
	fillStyle = "#ffffff";
	if (data.winner === 'none')
		drawBall(ctx, data.ball, fillStyle, scale);

    const score1 = document.getElementById('score1');
    const score2 = document.getElementById('score2');
    const name1  = document.getElementById('player1Name');
    const name2  = document.getElementById('player2Name');

    if (score1) score1.innerText = data.leftScore.toString();
    if (score2) score2.innerText = data.rightScore.toString();
    if (name1) name1.innerText = data.leftPlayerName;
    if (name2) name2.innerText = data.rightPlayerName;
}