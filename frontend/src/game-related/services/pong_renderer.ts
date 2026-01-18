
// import { 
//     CANVAS_WIDTH, CANVAS_HEIGHT, 
//     PADDLE_WIDTH, PADDLE_HEIGHT, 
//     BALL_RADIUS 
// } from './pong_constants';

import type { PongSessionData } from '../../../../shared/types'
// import { GameClient } from 

// export class PongRenderer {
// 	private ctx: CanvasRenderingContext2D;
// 	private canvas: HTMLCanvasElement;

// 	// i need to calculate these ratios to scale the game to ANY screen size
//     private scaleX: number = 1;
//     private scaleY: number = 1;

// 	constructor(canvas: HTMLCanvasElement) {
//         this.canvas = canvas;
//         const context = canvas.getContext('2d');

// 		if (!context) {
//             throw new Error("Could not get 2D context from canvas");
//         }
//         this.ctx = context;
// 	}

// 	// --------------- Helpers --------------------------
// 	private updateScale(): void {
//         this.scaleX = this.canvas.width / CANVAS_WIDTH;
//         this.scaleY = this.canvas.height / CANVAS_HEIGHT;
//     }

// 	private clear(): void {
//         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//     }

// 	/**
//      * The Main Draw Method
//      * i need to Call this inside the socket listener on msg.
//     */

// 	public draw(data: PongSessionData): void {
// 		// // console.log(" Drawing ....");
//         // if (!data) return;

// 		// const payload = data.payload;
// 		// if (!payload) return ;

// 		// // 1. Update Scale (based on the window size)
//         // // This ensures if the window resizes, so it drawes correctly
//         // this.updateScale();

// 		// // 2. Clear the previous frame
//         // this.clear();

// 		// // 3. Draw Game Elements
// 		// this.drawNet();
// 		// this.drawPaddles(payload);
// 		// this.drawBall(payload);
// 		// this.drawScores(payload);
//         // this.drawNames(payload.leftPlayerName, payload.rightPlayerName);

// 	}

// 	private drawNet(): void {
// 		this.ctx.beginPath();
// 		this.ctx.setLineDash([10 * this.scaleY, 15 * this.scaleY]); // Responsive dash size
// 		this.ctx.moveTo(this.canvas.width / 2, 0);
// 		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
// 		this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Faint white line
// 		this.ctx.lineWidth = 2 * this.scaleX;
// 		this.ctx.stroke();
// 		this.ctx.setLineDash([]); // Reset dash
// 	}

// 	private drawPaddles(payload: any): void {
// 		// const { paddle1, paddle2 } = data;
// 		const paddle1 = payload.leftPaddle;
// 		const paddle2 = payload.rightPaddle;

// 		// Player 1 (Left) - Purple
// 		this.ctx.fillStyle = "#a855f7"; 
// 		this.ctx.fillRect(
// 			paddle1.x * this.scaleX, 
// 			paddle1.y * this.scaleY, 
// 			PADDLE_WIDTH * this.scaleX, 
// 			PADDLE_HEIGHT * this.scaleY
// 		);

// 		// Player 2 (Right) - Blue
// 		this.ctx.fillStyle = "#3b82f6";
// 		this.ctx.fillRect(
// 			paddle2.x * this.scaleX, 
// 			paddle2.y * this.scaleY, 
// 			PADDLE_WIDTH * this.scaleX, 
// 			PADDLE_HEIGHT * this.scaleY
// 		);
// 	}

// 	private drawBall(payload: any): void {
//         const ball = payload.ball;

//         this.ctx.beginPath();
//         this.ctx.arc(
//             ball.x * this.scaleX, 
//             ball.y * this.scaleY, 
//             BALL_RADIUS * this.scaleX, // Scale radius so ball doesn't look big on any screens
//             0, 
//             Math.PI * 2
//         );
//         this.ctx.fillStyle = "#ffffff";
        
//         // // Add a subtle glow to the ball
//         // this.ctx.shadowBlur = 10;
//         // this.ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
//         // this.ctx.fill();
        
//         // // Reset Shadow for other elements (Performance)
//         // this.ctx.shadowBlur = 0;
//     }

// 	private drawScores(payload: any): void {
//         this.ctx.font = `bold ${40 * this.scaleY}px Arial`; // Responsive Font Size
//         this.ctx.fillStyle = "white";
//         this.ctx.textAlign = "center";

//         // Score 1 (Left)
//         this.ctx.fillText(
//             payload.leftScore.toString(), 
//             (CANVAS_WIDTH / 4) * this.scaleX, 
//             (CANVAS_HEIGHT / 5) * this.scaleY
//         );

//         // Score 2 (Right)
//         this.ctx.fillText(
//             payload.rightScore.toString(), 
//             (CANVAS_WIDTH * 0.75) * this.scaleX, 
//             (CANVAS_HEIGHT / 5) * this.scaleY
//         );
//     }

// 	private drawNames(p1Name: string, p2Name: string): void {
//         this.ctx.font = `bold ${14 * this.scaleY}px Arial`;
//         this.ctx.fillStyle = "#9ca3af"; // Gray-400
//         this.ctx.textAlign = "center";

//         // Name 1
//         this.ctx.fillText(
//             p1Name.toUpperCase(), 
//             (CANVAS_WIDTH / 4) * this.scaleX, 
//             30 * this.scaleY // Near top
//         );

//         // Name 2
//         this.ctx.fillText(
//             p2Name.toUpperCase(), 
//             (CANVAS_WIDTH * 0.75) * this.scaleX, 
//             30 * this.scaleY
//         );
//     }

// }



// Import your constants (Adjust path if needed)
// import { 
//     CANVAS_WIDTH, CANVAS_HEIGHT, 
//     PADDLE_WIDTH, PADDLE_HEIGHT, 
//     BALL_RADIUS 
// } from '../../pong_constants'; 

// // Define the payload type locally if you want to be safe, 
// // or import 'PongSessionData' from your types file.
// type PongPayload = {
//     leftPlayerName: string;
//     rightPlayerName: string;
//     leftPaddle: { x: number, y: number };
//     rightPaddle: { x: number, y: number };
//     ball: { x: number, y: number };
//     leftScore: number;
//     rightScore: number;
// };

// /**
//  * 1. SETUP FUNCTION
//  * Call this ONCE when the game page loads.
//  * It prepares the canvas and finds the HTML elements.
//  * Returns the 'draw' function you can call 60 times a second.
//  */
// export function createPongRenderer(canvas: HTMLCanvasElement) {
    
//     // --- A. Setup Context ---
//     const ctx = canvas.getContext('2d');
//     if (!ctx) throw new Error("Could not get 2D context");

//     // --- B. Cache HTML Elements (Performance Optimization) ---
//     // We find them once so we don't search the DOM every single frame.
//     const score1Elem = document.getElementById('score1');
//     const score2Elem = document.getElementById('score2');
//     const name1Elem  = document.getElementById('player1Name');
//     const name2Elem  = document.getElementById('player2Name');

//     // --- C. The Draw Function (The actual renderer) ---
//     return function draw(payload: PongPayload) {
//         if (!payload) return;

//         // 1. Calculate Scale (Responsive Support)
//         // This makes sure it draws correctly even if the window is resized.
//         const scaleX = canvas.width / CANVAS_WIDTH;
//         const scaleY = canvas.height / CANVAS_HEIGHT;

//         // 2. Clear Previous Frame
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // 3. Draw Net (Center Line)
//         drawNet(ctx, canvas.width, canvas.height, scaleX);

//         // 4. Draw Left Paddle (Purple)
//         ctx.fillStyle = "#a855f7"; 
//         ctx.fillRect(
//             payload.leftPaddle.x * scaleX,
//             payload.leftPaddle.y * scaleY,
//             PADDLE_WIDTH * scaleX,
//             PADDLE_HEIGHT * scaleY
//         );

//         // 5. Draw Right Paddle (Blue)
//         ctx.fillStyle = "#3b82f6";
//         ctx.fillRect(
//             payload.rightPaddle.x * scaleX,
//             payload.rightPaddle.y * scaleY,
//             PADDLE_WIDTH * scaleX,
//             PADDLE_HEIGHT * scaleY
//         );

//         // 6. Draw Ball
//         ctx.beginPath();
//         ctx.arc(
//             payload.ball.x * scaleX,
//             payload.ball.y * scaleY,
//             BALL_RADIUS * scaleX,
//             0,
//             Math.PI * 2
//         );
//         ctx.fillStyle = "#ffffff";
//         ctx.fill();

//         // 7. Update HTML UI (Text & Scores)
//         // We update the DOM elements directly instead of drawing text on canvas
//         if (score1Elem) score1Elem.innerText = payload.leftScore.toString();
//         if (score2Elem) score2Elem.innerText = payload.rightScore.toString();
        
//         if (name1Elem) name1Elem.innerText = payload.leftPlayerName;
//         if (name2Elem) name2Elem.innerText = payload.rightPlayerName;
//     };
// }

// // --- Helper: Draw the center dashed line ---
// function drawNet(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
//     ctx.beginPath();
//     ctx.setLineDash([10 * scale, 15 * scale]); 
//     ctx.moveTo(width / 2, 0);
//     ctx.lineTo(width / 2, height);
//     ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; 
//     ctx.lineWidth = 2 * scale;
//     ctx.stroke();
//     ctx.setLineDash([]); // Reset
// }


import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, 
    PADDLE_WIDTH, PADDLE_HEIGHT, 
    BALL_RADIUS 
} from './pong_constants'; // Import your constants

import type { PongPayload } from '../../../../shared/types';

// Define the shape of the data we expect
// interface PongPayload {
//     leftPlayerName: string;
//     rightPlayerName: string;
//     leftPaddle: { x: number, y: number };
//     rightPaddle: { x: number, y: number };
//     ball: { x: number, y: number };
//     leftScore: number;
//     rightScore: number;
// }

/**
 * PURE FUNCTION: Renders one frame of the game.
 * Call this every time you get a WebSocket message.
 */
export function renderPongFrame(canvas: HTMLCanvasElement, data: PongPayload) {
    
    // 1. Get Context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 2. Calculate Scale (Responsive)
    const scaleX = canvas.width / CANVAS_WIDTH;
    const scaleY = canvas.height / CANVAS_HEIGHT;

    // 3. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- DRAWING THE GAME BOARD ---

    // Draw Net (Center Line)
    ctx.beginPath();
    ctx.setLineDash([10 * scaleY, 15 * scaleY]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2 * scaleX;
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Draw Left Paddle (Purple)
    ctx.fillStyle = "#a855f7"; 
    ctx.fillRect(
        data.leftPaddle.x * scaleX,
        data.leftPaddle.y * scaleY,
        PADDLE_WIDTH * scaleX,
        PADDLE_HEIGHT * scaleY
    );

    // Draw Right Paddle (Blue)
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(
        data.rightPaddle.x * scaleX,
        data.rightPaddle.y * scaleY,
        PADDLE_WIDTH * scaleX,
        PADDLE_HEIGHT * scaleY
    );

    // Draw Ball
    ctx.beginPath();
    ctx.arc(
        data.ball.x * scaleX,
        data.ball.y * scaleY,
        BALL_RADIUS * scaleX,
        0, 
        Math.PI * 2
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // --- UPDATING HTML UI (Scores & Names) ---
    
    // We update the DOM elements directly here.
    // (Since this runs often, make sure your IDs in HTML are correct!)
    const score1 = document.getElementById('score1');
    const score2 = document.getElementById('score2');
    const name1  = document.getElementById('player1Name');
    const name2  = document.getElementById('player2Name');

    if (score1) score1.innerText = data.leftScore.toString();
    if (score2) score2.innerText = data.rightScore.toString();
    if (name1) name1.innerText = data.leftPlayerName;
    if (name2) name2.innerText = data.rightPlayerName;
}