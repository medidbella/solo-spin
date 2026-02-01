import waitingContent from '../pages/waiting.html?raw';
import { withLayout } from './layout';
import { navigateTo } from '../services/handle_pong_routes';
import { gameClient } from '../services/game_client';

// 1. Render Function
export function renderWaitingPage(): string {
	return withLayout(waitingContent);
}

// 2. Logic to attach events and customize message
export function setWaitingPageLogic() {
	
	const messageEl = document.getElementById('waitingMessage');
	const cancelBtn = document.getElementById('cancelWaitBtn');

	// 1. Customize Message based on Game Mode
	if (messageEl) {
		messageEl.textContent = "Initializing Game Arena...";
	}

	// 2. Define the Cancellation Logic
	let isCancelled = false; // Flag to stop navigation if user cancels

	// 3. Cancel Button Logic
	if (cancelBtn) {
		cancelBtn.addEventListener('click', () => {
			isCancelled = true;
			console.log("❌ User cancelled the operation");
			gameClient.reset(); // Clear data
			navigateTo('/home'); // Or back to setup
		});
	}

	// 4. The Async Fetch Function
	const performGameSetup = async () => {
		try {
			// console.log("⏳ Sending request to server...");

			// A. Send the Request
			const response = await gameClient.sendSetUpRequest();
			// console.log(" ## Received Respons ##\n", response);

			// Check if user cancelled while we were waiting
			if (isCancelled) return;

			// B. Handle Success: the session created completely and ready to start!!
			if (response.status === 'success') {
				// console.log("✅ Game Created successfully! navigating to play...");

				// set sessionID
				gameClient.setGameId(response.gameSessionId);

				// set side
				gameClient.setSide(response.side);

				gameClient.setPlayerState('READY');

				// // send start game message
				// console.log("Sending Start Game ws message");
				// gameClient.wsConnectionsHandler.createAndSendMessages('pong', 'START_GAME', gameClient.getGameId()!, null);
				
				// // Navigate to the Game Canvas page
				navigateTo('/games/pong/game-play');
			}

			// C. Handle Queued: the player is in the waiting queue needs the opponent
			else if (response.status === 'queued') {
				// console.log("⏳ Added to Queue. Waiting for WebSocket notification...");

				// 1. set side
				gameClient.setSide(response.side);

				gameClient.setPlayerState('WAITING_MATCH');

				// 2. Update UI to let the user know they must wait
				if (messageEl) {
					messageEl.textContent = "Waiting for an opponent...";
					// Optional: Add a CSS class to make it pulse or look different
					messageEl.classList.add('animate-pulse');
				}

				// will stay here until he got a ws messade then it routes to game page !!
			}
			
			// D. Handle Server Error (e.g., "System Busy")
			else {
				console.error(`❌ Server Error: ${response.error}`);
				alert(`Setup Failed: ${response.error}`); // Simple feedback
				navigateTo('/games/pong/setup'); // Go back to try again
			}

		} catch (error) {

			if (isCancelled) return;
			console.error("❌ Network Exception:", error);
			alert("Network error. Please check your connection.");
			navigateTo('/games/pong/setup');
		}
	};

	// 4. Trigger the fetch immediately
	performGameSetup();

}