
import { renderGameModePage } from '../renders/game_mode'; // New: Choose Local/Remote
import { renderPlayModePage } from '../renders/play_mode'; // New: Choose Random/Friend
import { renderFriendSetUpPage } from '../renders/friend_setup'; // New: Enter Friend Name
import { renderWaitingRoomPage } from '../renders/waiting-room'; // New: Waiting Room
import { renderGamePlayPage } from '../renders/game_play'; // The actual game


import { router } from '../../main';

export function handlePongRoutes(path: string) {
	let innerHTML: string | undefined
	
	switch (path) {

		case '/games/pong/game-mode':
			// Choose Local vs Remote
			innerHTML = renderGameModePage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				router('/games/games/pong/game-mode');
			}
			return innerHTML;
			
		case '/games/pong/play-mode':
			// Choose Friend vs Random
			innerHTML = renderPlayModePage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				router('/games/pong/play-mode');
			}
			return innerHTML;
		
		case '/games/pong/friend-match':
			// Enter Friend's Name
			innerHTML = renderFriendSetUpPage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				router('/games/pong/friend-match');
			}
			return innerHTML;
			
		case '/games/pong/waiting-room':
			// Waiting room
			innerHTML = renderWaitingRoomPage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				router('/games/pong/waiting-room');
			}
			return innerHTML;
		
		case '/games/pong/game-play':
			// The actual pong canvas
			innerHTML = renderGamePlayPage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				router('/games/pong/game-play');
			}
			return innerHTML;

		default:
			return "none";
	}
}