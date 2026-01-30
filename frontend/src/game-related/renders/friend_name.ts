
import friendNameContent from '../pages/friend_name.html?raw';
import { gameClient } from '../services/game_client';
import { withLayout } from './layout';
import { navigateTo } from '../services/handle_pong_routes';

function renderFriendNamePage(): string | undefined {
    return withLayout(friendNameContent);
}

function setFriendNameLogic() {

	// 1. Get DOM Elements
	const friendNameInput = document.getElementById('friendNameInput') as HTMLInputElement;
	const startGameBtn = document.getElementById('startGameBtn') as HTMLButtonElement;
	const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
	const titleElement = document.querySelector('h1'); // To update title dynamically
	
	const mode = gameClient.getGameMode();

	// 2. Safety Check
    if (!friendNameInput || !startGameBtn || !errorMessage) {
        console.error("❌ Friend Invite elements not found!");
        return;
    }

    // 3. Customize UI based on mode (Title AND Button)
    if (mode === 'remote') {
        if (titleElement) titleElement.textContent = "Challenge Online User";
        startGameBtn.textContent = "Send Invite"; // <--- Update Button Text
    } else {
        if (titleElement) titleElement.textContent = "Name Local Player 2";
        startGameBtn.textContent = "Start Game";  // <--- Update Button Text
    }

	// 4. Event Listener
    startGameBtn.addEventListener('click', (e) => {
	
		e.preventDefault(); // Prevent form submission if inside a form tag
		const friendName = friendNameInput.value.trim();
		const myName = gameClient.getPlayerName(); // Assuming this exists

		// A. Validation
        if (!friendName) {
            errorMessage.innerText = "⚠️ Please enter a name.";
            return;
        }

        // Set Freind Name & State
        gameClient.setFriendName(friendName);
        gameClient.setPlayerState('FRIEND_NAME_SELECTED');


		// --- REMOTE SPECIFIC LOGIC ---
        if (mode === 'remote') {
            // Check: Cannot invite yourself
            if (myName && friendName === myName) {
                errorMessage.innerText = "⚠️ You cannot invite yourself.";
                return;
            }

            // Check: Cannot invite empty (already done) or invalid characters
            // Action: Send WebSocket Invite
            console.log(`📡 [REMOTE] Sending invite to user: ${friendName}`);
            
            // Example: gameClient.sendInvite(friendName);
            // navigateTo('/waiting-room');
		}
		// --- LOCAL SPECIFIC LOGIC ---
        else if (mode === 'local') {
            // Check: Local Player 2 shouldn't be same as Player 1 (to avoid score confusion)
            if (myName && friendName === myName) {
                errorMessage.innerText = "⚠️ Player 2 must have a different name.";
                return;
            }
            // 2. RENDER WAITING PAGE IMMEDIATELY
            navigateTo('/games/pong/waiting');
        }

		// Clear errors if successful
        errorMessage.innerText = "";
	});
}

export { renderFriendNamePage, setFriendNameLogic}
