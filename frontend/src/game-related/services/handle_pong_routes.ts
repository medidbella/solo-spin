
import { renderGameModePage, setGameModeLogic } from '../renders/game_mode'; // New: Choose Local/Remote
import { renderPlayModePage, setPlayModeLogic } from '../renders/play_mode'; // New: Choose Random/Friend
import { renderFriendNamePage, setFriendNameLogic } from '../renders/friend_name'; // New: Enter Friend Name
import { renderWaitingPage, setWaitingPageLogic } from '../renders/waiting'; // New: Waiting Room
import { renderGamePlayPage, setGamePlayPageLogic } from '../renders/game_play'; // The actual game

// import { gameClient } from './game_client';

import { router } from '../../main';
import { gameClient } from './game_client';
import type { PlayerState, GameMode } from '../../../shared/types';
// import { createAndSendMessages } from './ws_handler';

export function navigateTo(url: string) {
    // 1. Update the URL in the browser history without reloading
    history.pushState(null, "", url);

    router(url);
}

function validateGameEntry(path: string): string {

	// console.log(" =============== Validating ====================");

	const playerState: PlayerState = gameClient.getPlayerState();
	const gameMode: GameMode | null = gameClient.getGameMode();
	const hasStarted: boolean = gameClient.getHasStarted();

	switch (path) {
		case '/games/pong/game-mode':
			if (playerState !== 'IDLE') {
				gameClient.reset();
			}
			break;
		
		case '/games/pong/friend-name':
			if (playerState === 'GAME_MODE_SELECTED' && gameMode === 'local')
				path = path;
			else {
				if (hasStarted || gameClient.getGameId())
					gameClient.wsConnectionsHandler.createAndSendMessages(gameClient.getGame(), 'BREAK', gameClient.getGameId(), null);

				gameClient.reset();
				path = '/games/pong/game-mode';
				history.pushState(null, "", path);
			}
			break;

		case '/games/pong/waiting':
			if ((playerState === 'FRIEND_NAME_SELECTED' && gameMode === 'local') || (playerState === 'GAME_MODE_SELECTED' && gameMode === 'remote'))
				path = path;
			else {
				if (hasStarted || gameClient.getGameId())
					gameClient.wsConnectionsHandler.createAndSendMessages(gameClient.getGame(), 'BREAK', gameClient.getGameId(), null);

				gameClient.reset();
				path = '/games/pong/game-mode';
				history.pushState(null, "", path);
			}
			break;

		case '/games/pong/game-play':
			if ((playerState === 'WAITING_MATCH') || (playerState === 'READY'))
				path = path;
			else {

				// console.log("  Game Id: ", gameClient.getGameId());

				if (hasStarted || gameClient.getGameId()) {
					// console.log("   ==> Sending Break Message <==");
					gameClient.wsConnectionsHandler.createAndSendMessages(gameClient.getGame(), 'BREAK', gameClient.getGameId(), null);
				}

				gameClient.reset();
				path = '/games/pong/game-mode';
				history.pushState(null, "", path);
			}
			break;
		
		default:
			break;
	}

	// console.log(`  ## Up dated path: ${path}  ##`);
	// console.log(" =============== End Of Validating ====================");
	return path;
}

export function handlePongRoutes(path: string, app: HTMLElement) {
	let innerHTML: string | undefined

	// console.log("  ## Pong Routes ## ");

	if (path === '/games/pong/') path = '/games/pong/game-mode';

	path = validateGameEntry(path);
	
	switch (path) {

		// CASE 1: Game Mode Selection
		case '/games/pong/game-mode':
			innerHTML = renderGameModePage();
			if (!innerHTML) {
				// console.log(" ERROR: can't read the file, try again!!");
				// router('/games/games/pong/game-mode');
				return ;
			}
			// return innerHTML;

			app.innerHTML = innerHTML; // 1. Render HTML
            setGameModeLogic();        // 2. Attach Listeners immediately
            break;

		// CASE 2: Play Mode Selection	
		// case '/games/pong/play-mode':
		// 	// console.log( "  ====>> play mode detected <<===");
		// 	innerHTML = renderPlayModePage();
		// 	if (!innerHTML) {
		// 		// console.log(" ERROR: can't read the file, try again!!");
		// 		// router('/games/pong/play-mode');
		// 		return ;
		// 	}
		// 	// return innerHTML;
		// 	app.innerHTML = innerHTML; // 1. Render HTML
        //     setPlayModeLogic();        // 2. Attach Listeners immediately
        //     break;
		
		case '/games/pong/friend-name':
			// Enter Friend's Name
			innerHTML = renderFriendNamePage();
			if (!innerHTML) {
				// console.log(" ERROR: can't read the file, try again!!");
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
				// console.log(" ERROR: can't read the file, try again!!");
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
				// console.log(" ERROR: can't read the file, try again!!");
				// router('/games/pong/game-play');
				return ;
			}
			app.innerHTML = innerHTML;

			const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
			// Initialize the Canvas & start logic
			if (canvas) {
				// gameClient.initGamePage(canvas);
				
				// Start logic
				setGamePlayPageLogic(); 
			}
			break;

		default:
			return "none";
	}
}
