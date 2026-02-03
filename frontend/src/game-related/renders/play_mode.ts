
import playModeContent from '../pages/play_mode.html?raw';
import { gameClient } from '../services/game_client';
import { withLayout } from './layout';
import { navigateTo } from '../services/handle_pong_routes';

function renderPlayModePage() {
	return withLayout(playModeContent);
}

function setPlayModeLogic() {

	const playFriendBtn = document.getElementById('playFriendBtn') as HTMLButtonElement;
	const playRandomBtn = document.getElementById('playRandomBtn') as HTMLButtonElement;
	const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

	if (!playFriendBtn || !playRandomBtn || !errorMessage) { return; }

	playFriendBtn.addEventListener('click', () => {

		// console.log('🎮 User selected: Play with Friend');
		gameClient.setPlayMode('friend');
        gameClient.setPlayerState('PLAY_MODE_SELECTED');

        navigateTo('/games/pong/friend-name');
	});

	playRandomBtn.addEventListener('click', () => {
		gameClient.setPlayMode('random');
	});


}

export { setPlayModeLogic, renderPlayModePage };