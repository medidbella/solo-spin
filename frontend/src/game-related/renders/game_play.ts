
import gamePlayContent from '../pages/game_play.html?raw';
import { renderHeader } from '../../components/Header';
import { gameClient } from '../services/game_client';

// import { withLayout } from './layout';
// import { navigateTo } from '../services/handle_pong_routes';

function withGameLayout(contentHTML: string): string {
    return /* html */ `
    <div class="flex flex-col h-screen w-full bg-[#0f0c18] text-white select-none overflow-hidden">
        
        ${renderHeader()} 

        <main class="flex-1 flex items-center justify-center relative w-full h-full">
            ${contentHTML}
        </main>
    </div>
    `;
}


// 1. Render Function
export function renderGamePlayPage(): string {
	return withGameLayout(gamePlayContent);
}

export function setGamePlayPageLogic() {

	// 1. Find the Canvas Element (It is now in the DOM!)
    const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("❌ Canvas not found! Game cannot start.");
        return;
    }

	// 2. Initialize the Game Engine (Renderer + WS Listener)
    gameClient.initGamePage(canvas);

	// 3. TRACKING FLAG
    // This variable lives only as long as this page logic is running
	// i'm using this flag to make sure that the playe sends start game message once!!
	let hasStarted = false;
    console.log(`  Create the hasStarted: ${hasStarted}`);

	// 4. Setup Input Listeners (Paddle Movement)
    // I listen to the WINDOW for key presses

    // window.addEventListener('keydown', handleInput);
    // window.addEventListener('keyup', handleInput);

	// --- Handle 4 Keys (W, S, Up, Down) ---
    function handleInput(e: KeyboardEvent) {

        // Prevent scrolling with arrows
        if(["ArrowUp", "ArrowDown", "KeyW", "KeyS", "Space"].includes(e.code)) {
            e.preventDefault();
        }

        // check the type of pressed key
        if (e.type === 'keydown') {
			const gameId: string | null = gameClient.getGameId();
			if (!gameId)
				return ;
			
            if (e.code === 'ArrowUp') {
                // client.wsConnectionsHandler.sendMove('UP'); 
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'UP');
                console.log("⬆️ UP");

            } else if (e.code === 'ArrowDown') {
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'DOWN');
                console.log("⬇️ DOWN");

            } else if (e.code === 'KeyW') {
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'W');
                console.log("⬆️ W");

			} else if (e.code === 'KeyS') {
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'GAME_INPUT', gameId, 'S');
                console.log("⬇️ S");

			} else if (!hasStarted && e.code === 'Space') {
				console.log(" Space: 🚀 Sending Start Game WS message...");
				gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'START_GAME', gameId, null);
				hasStarted = true;
				console.log(` Update hasStarted flag: ${hasStarted}`);
			}
        }
    }

	// 4. send start game message: TELL SERVER I AM READY:
    // console.log("🚀 Sending Start Game WS message...");
	// gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'START_GAME', gameClient.getGameId()!, null);
}

