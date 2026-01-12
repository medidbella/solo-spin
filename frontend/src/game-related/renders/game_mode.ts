

import gameModeContent from '../pages/game_mode.html?raw';
import { gameClient } from '../services/game_client';

import { router } from '../../main';

function renderGameModePage() {
	return gameModeContent;
}

function setGameModeLogic() {

	const localModeBtn = document.getElementById('localModeBtn') as HTMLButtonElement;
	const remoteModeBtn = document.getElementById('remoteModeBtn') as HTMLButtonElement;
	const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

	if (!localModeBtn || !remoteModeBtn || !errorMessage) { return; }

	// 1. local Game event listener
	localModeBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Local Game');
		gameClient.setGameMode('local');

		// NAVIGATE HERE, only after clicking
        router('/games/pong/friend-name');
	});

	// 2. local Game event listener
	remoteModeBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Remote Game');
		gameClient.setGameMode('remote');

		router('/games/pong/play-mode');
	});
	
}

export { renderGameModePage, setGameModeLogic };