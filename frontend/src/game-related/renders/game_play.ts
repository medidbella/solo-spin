
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

	// 3. Setup Input Listeners (Paddle Movement)
    // We listen to the WINDOW for key presses
    window.addEventListener('keydown', handleInput);
    window.addEventListener('keyup', handleInput);

	// --- Helper for Inputs ---
    function handleInput(e: KeyboardEvent) {
        // Prevent scrolling with arrows
        if(["ArrowUp","ArrowDown","Space"].indexOf(e.code) > -1) {
            e.preventDefault();
        }

        // Send move to server (Implementation depends on your WSHandler)
        if (e.type === 'keydown') {
            if (e.code === 'ArrowUp') {
                 // client.wsConnectionsHandler.sendMove('UP'); 
                 console.log("⬆️ UP");
            } else if (e.code === 'ArrowDown') {
                 // client.wsConnectionsHandler.sendMove('DOWN');
                 console.log("⬇️ DOWN");
            }
        }
    }

	// 4. send start game message: TELL SERVER I AM READY:
    console.log("🚀 Sending Start Game WS message...");
	gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'START_GAME', gameClient.getGameId()!, null);

}

