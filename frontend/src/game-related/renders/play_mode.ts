
// import * as fs from 'fs'; // Import the file system module

import playModeContent from '../pages/play_mode.html?raw';
import { gameClient } from '../services/game_client';

import { withLayout } from './layout';

// import { router } from '../../main';
import { navigateTo } from '../services/handle_pong_routes';

function renderPlayModePage() {
	// return playModeContent;

	return withLayout(playModeContent);

}

function setPlayModeLogic() {

	const playFriendBtn = document.getElementById('playFriendBtn') as HTMLButtonElement;
	const playRandomBtn = document.getElementById('playRandomBtn') as HTMLButtonElement;
	const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

	if (!playFriendBtn || !playRandomBtn || !errorMessage) { return; }

	// 1. play with Friend event listener
	playFriendBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Play with Friend');
		gameClient.setPlayMode('friend');
        gameClient.setPlayerState('PLAY_MODE_SELECTED');
		// MOVED INSIDE: Navigate immediately after setting state

        // router('/games/pong/friend-name');
        navigateTo('/games/pong/friend-name');
	});

	// 2. Play Random event listener
	playRandomBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Play Random');
		gameClient.setPlayMode('random');

        // router('/games/pong/witing-room');
        // navigateTo('/games/pong/witing-room');
	});


}

export { setPlayModeLogic, renderPlayModePage };