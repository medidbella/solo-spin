
import { renderGameModePage, setGameModeLogic } from '../renders/game_mode'; // New: Choose Local/Remote
import { renderPlayModePage, setPlayModeLogic } from '../renders/play_mode'; // New: Choose Random/Friend
import { renderFriendNamePage, setFriendNameLogic } from '../renders/friend_name'; // New: Enter Friend Name
import { renderWaitingPage, setWaitingPageLogic } from '../renders/waiting'; // New: Waiting Room
import { renderGamePlayPage, setGamePlayPageLogic } from '../renders/game_play'; // The actual game

import { gameClient } from './game_client';

import { router } from '../../main';

export function navigateTo(url: string) {
    // 1. Update the URL in the browser history without reloading
    history.pushState(null, "", url);

    router(url);
}

export function handlePongRoutes(path: string, app: HTMLElement) {
	let innerHTML: string | undefined

	return ; ////////////////////////////////////  !!!!!! 
	
	// this should be in the top on the main routes cases (main.ts), tmp for now !!!!
	// if (window.location.pathname === '/games/pong/game-play' && path !== '/games/pong/game-play') {
	// 	// We are navigating AWAY from the game
	// 	gameClient.cleanupGamePage();
		
	// 	// Also remove window event listeners for keys if you added them
	// 	// window.removeEventListener('keydown', handleInput); 
	// 	// window.removeEventListener('keyup', handleInput);
	// }
	
	switch (path) {

		// CASE 1: Game Mode Selection
		case '/games/pong/game-mode':
			innerHTML = renderGameModePage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				// router('/games/games/pong/game-mode');
				return ;
			}
			// return innerHTML;

			app.innerHTML = innerHTML; // 1. Render HTML
            setGameModeLogic();        // 2. Attach Listeners immediately
            break;

		// CASE 2: Play Mode Selection	
		case '/games/pong/play-mode':
			// console.log( "  ====>> play mode detected <<===");
			innerHTML = renderPlayModePage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				// router('/games/pong/play-mode');
				return ;
			}
			// return innerHTML;
			app.innerHTML = innerHTML; // 1. Render HTML
            setPlayModeLogic();        // 2. Attach Listeners immediately
            break;
		
		case '/games/pong/friend-name':
			// Enter Friend's Name
			innerHTML = renderFriendNamePage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				// router('/games/pong/friend-match');
				return ;
			}
			app.innerHTML = innerHTML;
			setFriendNameLogic();
			break;
			
		case '/games/pong/waiting':
			// Waiting room
			innerHTML = renderWaitingPage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				// router('/games/pong/waiting-room');
				return;
			}
			app.innerHTML = innerHTML;
			setWaitingPageLogic();
			break;
		
		case '/games/pong/game-play':
			// Render the HTML first
			innerHTML = renderGamePlayPage();
			if (!innerHTML) {
				console.log(" ERROR: can't read the file, try again!!");
				// router('/games/pong/game-play');
				return ;
			}
			app.innerHTML = innerHTML;

			const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
			// Initialize the Canvas & start logic
			if (canvas) {
				gameClient.initGamePage(canvas);
				
				// Start logic
				setGamePlayPageLogic(); 
			}
			break;

		default:
			return "none";
	}
}
