
import gamePlayContent from '../pages/game_play.html?raw';
import { renderHeader } from '../../components/Header';
import { gameClient } from '../services/game_client';
import { FRAME_TIME_MS } from '../services/pong_constants';

// import { withLayout } from './layout';
import { navigateTo } from '../services/handle_pong_routes';

export function withGameLayout(contentHTML: string): string {
    return /* html */ `
    <div class="flex flex-col h-screen w-full bg-[#0F0317] text-[#F2F2F2] font-[solo] select-none overflow-hidden">
        
        ${renderHeader()}

        <main class="flex-1 flex flex-col items-center justify-center relative w-full h-full p-4">
            ${contentHTML}
        </main>
    </div>
    `;
}


// 1. Render Function
export function renderGamePlayPage(): string {
	return withGameLayout(gamePlayContent);
}

// 2. page logic
export function setGamePlayPageLogic() {

	// 1. Find the Canvas Element (It is now in the DOM!)
	const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
	const pauseBtn = document.getElementById('pauseBtn') as HTMLCanvasElement;
	const startMsg = document.getElementById('startMessage');
	if (!canvas || !pauseBtn || !startMsg) {
		console.error("❌ Critical elements not found! Game cannot start.");
		return;
	}

	// 2. Initialize the Game Engine (Renderer + WS Listener)
	gameClient.initGamePage(canvas);

	// 3. STATE TRACKING
	// let isPaused = false;
    const keysPressed: { [key: string]: boolean } = {
        ArrowUp: false,
        ArrowDown: false,
        KeyW: false,
        KeyS: false
    };

	// ---------------------------------------------------------
    // ⏸️ PAUSE BUTTON LOGIC
    // ---------------------------------------------------------
    const handlePauseToggle = () => {
		// Only allow pause if the game has actually started
        if (!gameClient.getHasStarted()) return;

		// isPaused = !isPaused;
		gameClient.setIsPaused(!gameClient.getIsPaused());
        const icon = pauseBtn.querySelector('i');

		if (gameClient.getIsPaused()) {
			// SWITCH TO PLAY ICON
            icon?.classList.remove('fa-pause');
            icon?.classList.add('fa-play');

			// Optional: Add a visual blur to canvas to show it's paused
            canvas.style.opacity = '0.5';

			// console.log("⏸️ PAUSE SENT");
			// TODO: Uncomment when you add PAUSE to your WS Handler types
			// gameClient.setIsPaused(true);
            gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'PAUSE', gameClient.getGameId()!, null);
		} else {
			// SWITCH TO PAUSE ICON
            icon?.classList.remove('fa-play');
            icon?.classList.add('fa-pause');

			// Remove blur
            canvas.style.opacity = '1';

			// console.log("▶️ RESUME SENT");
			// gameClient.setIsPaused(true);
            gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'RESUME', gameClient.getGameId()!, null);
		}
	};

	
	// 4. LISTENERS
	
	pauseBtn.addEventListener('click', handlePauseToggle);

	// ---------------------------------------------------------
    // ⌨️ KEYBOARD INPUT LOGIC
    // ---------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => updateKeyState(e, true, keysPressed);
    const handleKeyUp = (e: KeyboardEvent) => updateKeyState(e, false, keysPressed);


	window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

	// 5. REGISTER CLEANUP
	// pass 'type' + function reference to "removeEventListener" to remove it
    gameClient.setCleanupListeners(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
		pauseBtn.removeEventListener('click', handlePauseToggle); // Remove button listener
    });
}

// THE INPUT LOOP
// this check what's the input and send message to the server
function startInputLoop(keysPressed: any) {
	const gameId = gameClient.getGameId();
	if (!gameId) return;
	
	const inputLoopId = window.setInterval(() => {

		// Check Player 1 (Left)
		if (keysPressed['KeyW']) {
			gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'W');
		}
		if (keysPressed['KeyS']) {
			gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'S');
		}

		// Check Player 2 (Right) - INDEPENDENTLY
		if (keysPressed['ArrowUp']) {
			gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'UP');
		}
		if (keysPressed['ArrowDown']) {
			gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'DOWN');
		}

	}, FRAME_TIME_MS);

	gameClient.setInputLoopId(inputLoopId);
}

// START THE INPUT LOOP NOW
function startGame(keysPressed: any) {
	// console.log("🚀 Space: Sending Start Game...");

		// 1. Send the Message
		gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'START_GAME', gameClient.getGameId()!, null);
		gameClient.setHasStarted(true);
		
		// 2. Start Input Loop
		if (!gameClient.getInputLoopId()) {
			startInputLoop(keysPressed);
		}

		// 3. Hide the "Press Space" Message
		const startMsg = document.getElementById('startMessage');
		if (startMsg) {
			startMsg.classList.add('hidden'); // This hides it using Tailwind
			// OR ==>> startMsg.style.display = 'none';
		}
}

function updateKeyState(e: KeyboardEvent, isPressed: boolean, keysPressed: any) {

	if (gameClient.getIsPaused())
		return;
	
	// Prevent scrolling
	if (["ArrowUp", "ArrowDown", "KeyW", "KeyS", "Space"].includes(e.code)) {
		e.preventDefault();
	}

	// Handle START (Space) separately - it's a trigger, not a hold
	if (e.code === 'Space' && isPressed && !gameClient.getHasStarted()) {
		startGame(keysPressed);
	}

	// Update movement keys map
	if (keysPressed.hasOwnProperty(e.code)) {
		keysPressed[e.code] = isPressed;
	}
}


export function handleGameOver(payload: any) {
	const gameOverEl = document.getElementById('gameOverMessage');
    const winnerTextEl = document.getElementById('winnerText');
    const homeBtn = document.getElementById('backHomeBtn');

	if (gameOverEl && winnerTextEl) {
        
		// 1. Determine the winner's actual name
		let winnerName = "DRAW";
        if (payload.winner === 'leftPlayer') winnerName = payload.leftPlayerName;
        else if (payload.winner === 'rightPlayer') winnerName = payload.rightPlayerName;

		// 2. Update Text
        winnerTextEl.innerText = `${winnerName.toUpperCase()} WINS!`;

		// 3. Show the Overlay
        gameOverEl.classList.remove('hidden');
        gameOverEl.classList.add('flex');

		// 4. Attach Navigation to Button
        if (homeBtn) {

            homeBtn.onclick = () => {

                // Hide the modal
                gameOverEl.classList.add('hidden');
                gameOverEl.classList.remove('flex');
                
                // Navigate to home
                navigateTo('/home');
            };
        }

		// 5. reset states: STOP THE GAME LOGIC
		gameClient.reset()
	}
}