

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

    const checkConnection = (): boolean => {
        if (!gameClient.wsConnectionsHandler.isSocketConnected()) {
            errorMessage.innerText = "⚠️ Disconnected from server. Please refresh the page.";
            errorMessage.classList.remove('hidden');
            return false;
        }
        errorMessage.innerText = "";
        return true;
    };

	localModeBtn.addEventListener('click', () => {

		if (!checkConnection()) return;

		gameClient.setGame('pong');
		gameClient.setGameMode('local');
        gameClient.setPlayerState('GAME_MODE_SELECTED');

        navigateTo('/games/pong/friend-name');
	});

	remoteModeBtn.addEventListener('click', () => {

		if (!checkConnection()) return;

		gameClient.setGame('pong');
		gameClient.setGameMode('remote');
        gameClient.setPlayerState('GAME_MODE_SELECTED');

		navigateTo('/games/pong/waiting');
	});
	
}

export { renderGameModePage, setGameModeLogic };