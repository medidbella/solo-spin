import waitingContent from '../pages/waiting.html?raw';
import { withLayout } from './layout';
import { navigateTo } from '../services/handle_pong_routes';
import { gameClient } from '../services/game_client';

export function renderWaitingPage(): string {
	return withLayout(waitingContent);
}

export function setWaitingPageLogic() {
	
	const messageEl = document.getElementById('waitingMessage');
	const cancelBtn = document.getElementById('cancelWaitBtn');

	if (messageEl) {
		messageEl.textContent = "Initializing Game Arena...";
	}

	let isCancelled = false;

	// Cancel Button Logic
	if (cancelBtn) {
		cancelBtn.addEventListener('click', () => {
			isCancelled = true;
			gameClient.reset(); // Clear data
			navigateTo('/games/pong/game-mode'); // Or back to setup
		});
	}

	const performGameSetup = async () => {
		try {

			// Send the Post Request (for setting up the game)
			const response = await gameClient.sendSetUpRequest();

			if (isCancelled) return;

			if (response.status === 'success') {
				gameClient.setGameId(response.gameSessionId);
				gameClient.setSide(response.side);
				gameClient.setPlayerState('READY');
				navigateTo('/games/pong/game-play');
			}

			else if (response.status === 'queued') {
				gameClient.setSide(response.side);
				gameClient.setPlayerState('WAITING_MATCH');
				if (messageEl) {
					messageEl.textContent = "Waiting for an opponent...";
					messageEl.classList.add('animate-pulse');
				}
			}
			
			else if (response.status === 'error') {
				alert(`Setup Failed: ${response.error}`);
				navigateTo('/games/pong/game-mode');
			}
		} catch (error) {

			if (isCancelled) return;
			alert("Network error. Please check your connection.");
			navigateTo('/games/pong/setup');
		}
	};
	performGameSetup();
}