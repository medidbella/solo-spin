

import gameModeContent from '../pages/game_mode.html?raw';
import { gameClient } from '../services/game_client';

import { withLayout } from './layout';

import { navigateTo } from '../services/handle_pong_routes';

function renderGameModePage() {
	return withLayout(gameModeContent);
}

function setGameModeLogic() {

	const localModeBtn = document.getElementById('localModeBtn') as HTMLButtonElement;
	const remoteModeBtn = document.getElementById('remoteModeBtn') as HTMLButtonElement;
	const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

	if (!localModeBtn || !remoteModeBtn || !errorMessage) { return; }

	// Helper to check connection
    const checkConnection = (): boolean => {
        if (!gameClient.wsConnectionsHandler.isSocketConnected()) {
            errorMessage.innerText = "⚠️ Disconnected from server. Please refresh the page.";
            errorMessage.classList.remove('hidden'); // Ensure it's visible if you use 'hidden' class
            return false;
        }
        errorMessage.innerText = ""; // Clear error if healthy
        return true;
    };

	// 1. local Game event listener
	localModeBtn.addEventListener('click', () => {

		// Check Connection
		if (!checkConnection()) return;

		// console.log('🎮 User selected: Local Game');
		gameClient.setGame('pong');
		gameClient.setGameMode('local');
        gameClient.setPlayerState('GAME_MODE_SELECTED');

		// NAVIGATE HERE, only after clicking
        navigateTo('/games/pong/friend-name');
	});

	// 2. local Game event listener
	remoteModeBtn.addEventListener('click', () => {

		// Check Connection
		if (!checkConnection()) return;

		// console.log('🎮 User selected: Remote Game');
		gameClient.setGame('pong');
		gameClient.setGameMode('remote');
        gameClient.setPlayerState('GAME_MODE_SELECTED');

		navigateTo('/games/pong/waiting');
	});
	
}

export { renderGameModePage, setGameModeLogic };