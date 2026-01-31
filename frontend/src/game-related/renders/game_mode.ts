

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

	// 1. local Game event listener
	localModeBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Local Game');
		gameClient.setGame('pong');
		gameClient.setGameMode('local');
        gameClient.setPlayerState('GAME_MODE_SELECTED');

		// NAVIGATE HERE, only after clicking
        navigateTo('/games/pong/friend-name');
	});

	// 2. local Game event listener
	remoteModeBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Remote Game');
		gameClient.setGame('pong');
		gameClient.setGameMode('remote');
        gameClient.setPlayerState('GAME_MODE_SELECTED');

		navigateTo('/games/pong/waiting');
	});
	
}

export { renderGameModePage, setGameModeLogic };