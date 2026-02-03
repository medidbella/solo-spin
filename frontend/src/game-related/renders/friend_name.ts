
import friendNameContent from '../pages/friend_name.html?raw';
import { gameClient } from '../services/game_client';
import { withLayout } from './layout';
import { navigateTo } from '../services/handle_pong_routes';

function renderFriendNamePage(): string | undefined {
    return withLayout(friendNameContent);
}

function setFriendNameLogic() {

	//Get DOM Elements
	const friendNameInput = document.getElementById('friendNameInput') as HTMLInputElement;
	const startGameBtn = document.getElementById('startGameBtn') as HTMLButtonElement;
	const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
	const titleElement = document.querySelector('h1');
	
	const mode = gameClient.getGameMode();

    if (!friendNameInput || !startGameBtn || !errorMessage)
        return;

    if (mode === 'remote') {
        if (titleElement) titleElement.textContent = "Challenge Online User";
        startGameBtn.textContent = "Send Invite";
    } else {
        if (titleElement) titleElement.textContent = "Name Local Player 2";
        startGameBtn.textContent = "Start Game";
    }

	// Event Listener
    startGameBtn.addEventListener('click', (e) => {
		e.preventDefault();

		const friendName = friendNameInput.value.trim();
		const myName = gameClient.getPlayerName();

        if (!friendName) {
            errorMessage.innerText = " Please enter a name.";
            return;
        }

        gameClient.setFriendName(friendName);
        gameClient.setPlayerState('FRIEND_NAME_SELECTED');


		// --- REMOTE SPECIFIC LOGIC ---
        if (mode === 'remote') {
            // Check: Cannot invite yourself
            if (myName && friendName === myName) {
                errorMessage.innerText = "You cannot invite yourself.";
                return;
            }
		}
		// --- LOCAL SPECIFIC LOGIC ---
        else if (mode === 'local') {
            if (myName && friendName === myName) {
                errorMessage.innerText = "Player 2 must have a different name.";
                return;
            }
            navigateTo('/games/pong/waiting');
        }
        errorMessage.innerText = "";
	});
}

export { renderFriendNamePage, setFriendNameLogic}
