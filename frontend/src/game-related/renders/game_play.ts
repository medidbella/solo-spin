
import gamePlayContent from '../pages/game_play.html?raw';
import { renderHeader } from '../../components/Header';
import { gameClient } from '../services/game_client';
import { FRAME_TIME_MS } from '../services/pong_constants';
import type { GameMode, Side } from '../../../shared/types';
import { navigateTo } from '../services/handle_pong_routes';

export function withGameLayout(contentHTML: string): string {
    return /* html */ `
    <div class="flex flex-col h-screen w-full bg-[#0F0317] text-[#F2F2F2] font-[solo] select-none overflow-hidden">
        
        ${renderHeader()}

        <main class="flex-1 flex flex-col items-center justify-center relative w-full h-full overflow-hidden">
            ${contentHTML}
        </main>
    </div>
    `;
}

export function renderGamePlayPage(): string {
	return withGameLayout(gamePlayContent);
}

export function setGamePlayPageLogic() {

	const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
	const pauseBtn = document.getElementById('pauseBtn') as HTMLCanvasElement;
	const startMsg = document.getElementById('startMessage');

	if (!canvas || !pauseBtn || !startMsg)
		return;

	gameClient.initGamePage(canvas);

	const gameMode: GameMode = gameClient.getGameMode() || 'local';

	if (gameMode === 'remote')
        pauseBtn.style.display = 'none';

    const keysPressed: { [key: string]: boolean } = {
        ArrowUp: false,
        ArrowDown: false,
        KeyW: false,
        KeyS: false
    };

	// ---------------------------------------------------------
    // PAUSE BUTTON LOGIC (Only active for Local)
    // ---------------------------------------------------------
    const handlePauseToggle = () => {
        if (!gameClient.getHasStarted() || gameMode == 'remote') return;

		gameClient.setIsPaused(!gameClient.getIsPaused());
        const icon = pauseBtn.querySelector('i');
		if (!icon)
			return ;

		if (gameClient.getIsPaused()) {
			// SWITCH TO PLAY ICON
			icon.classList.remove('fa-pause');
			icon.classList.add('fa-play');
            canvas.style.opacity = '0.5';
            gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'PAUSE', gameClient.getGameId()!, null);
		} else {
			// SWITCH TO PAUSE ICON
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
			// Remove blur
            canvas.style.opacity = '1';
            gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'RESUME', gameClient.getGameId()!, null);
		}
	};

	pauseBtn.addEventListener('click', handlePauseToggle);
	
	// ---------------------------------------------------------
    // KEYBOARD INPUT LOGIC
    // ---------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => updateKeyState(e, true, keysPressed);
    const handleKeyUp = (e: KeyboardEvent) => updateKeyState(e, false, keysPressed);
	
	// LISTENERS
	window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

	// REGISTER CLEANUP
    gameClient.setCleanupListeners(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
		if (gameMode === 'local') {
			pauseBtn.removeEventListener('click', handlePauseToggle);
		}
    });
}

// THE INPUT LOOP
function startInputLoop(keysPressed: any) {
	const gameId = gameClient.getGameId();
	if (!gameId) return;

	const gameMode: GameMode = gameClient.getGameMode() || 'local';
	const playerSide: Side | null = gameClient.getSide();
	
	const inputLoopId = window.setInterval(() => {

		// --- LOCAL MODE (Handle Both Players) ---
        if (gameMode === 'local') {
			// Check Player 1 (Left)
			if (keysPressed['KeyW']) {
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'W');
			}
			if (keysPressed['KeyS']) {
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'S');
			}
			
			// Check Player 2 (Right)
			if (keysPressed['ArrowUp']) {
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'UP');
			}
			if (keysPressed['ArrowDown']) {
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'DOWN');
			}
		}

		// --- REMOTE MODE (Handle Only My Side) ---
        else if (gameMode === 'remote') {
			const upPressed = keysPressed['ArrowUp'] || keysPressed['KeyW'];
            const downPressed = keysPressed['ArrowDown'] || keysPressed['KeyS'];

			if (playerSide === 'left') {
                if (upPressed)
					gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'W');
                if (downPressed)
					gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'S');

			}
			else if (playerSide === 'right') {
                if (upPressed)
					gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'UP');

                if (downPressed)
					gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'DOWN');
            }
		}

	}, FRAME_TIME_MS);

	gameClient.setInputLoopId(inputLoopId);
}

// START THE INPUT LOOP NOW
function startGame(keysPressed: any) {
	gameClient.setPlayerState('PLAYING');

		// Send Start Message
		gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'START_GAME', gameClient.getGameId()!, null);
		gameClient.setHasStarted(true);

		
		// Start Input Loop
		if (!gameClient.getInputLoopId()) {
			startInputLoop(keysPressed);
		}

		// Hide the "Press Space" Message
		const startMsg = document.getElementById('startMessage');
		if (startMsg) {
			startMsg.classList.add('hidden');
		}
}

function updateKeyState(e: KeyboardEvent, isPressed: boolean, keysPressed: any) {

	if (gameClient.getIsPaused())
		return;

	if (["ArrowUp", "ArrowDown", "KeyW", "KeyS", "Space"].includes(e.code)) {
		e.preventDefault();
	}

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

		let winnerName = "DRAW";
        if (payload.winner === 'leftPlayer') winnerName = payload.leftPlayerName;
        else if (payload.winner === 'rightPlayer') winnerName = payload.rightPlayerName;

        winnerTextEl.innerText = `${winnerName.toUpperCase()} WINS!`;

        gameOverEl.classList.remove('hidden');
        gameOverEl.classList.add('flex');

        if (homeBtn) {

            homeBtn.onclick = () => {
                gameOverEl.classList.add('hidden');
                gameOverEl.classList.remove('flex');
                navigateTo('/home');
            };
        }
		gameClient.reset();
	}
}