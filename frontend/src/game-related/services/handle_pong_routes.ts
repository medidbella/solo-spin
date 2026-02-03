
import { renderGameModePage, setGameModeLogic } from '../renders/game_mode'; // New: Choose Local/Remote
import { renderFriendNamePage, setFriendNameLogic } from '../renders/friend_name'; // New: Enter Friend Name
import { renderWaitingPage, setWaitingPageLogic } from '../renders/waiting'; // New: Waiting Room
import { renderGamePlayPage, setGamePlayPageLogic } from '../renders/game_play'; // The actual game
import { router } from '../../main';
import { gameClient } from './game_client';
import type { PlayerState, GameMode, AvailableGames } from '../../../shared/types';
import { setupHeaderLogic } from '../../components/Header';

export function navigateTo(url: string) {
    history.pushState(null, "", url);
    router(url);
}

function validateGameEntry(path: string): string {

	const playerState: PlayerState = gameClient.getPlayerState();
	const gameMode: GameMode | null = gameClient.getGameMode();
	const gameId: string | null = gameClient.getGameId();
	let game: AvailableGames | null = gameClient.getGame();
	if (!game) {
		game = 'pong';
		gameClient.setGame(game);
	}

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
				if (gameId)
					gameClient.wsConnectionsHandler.createAndSendMessages(game, 'BREAK', gameId, null);

				gameClient.reset();
				path = '/games/pong/game-mode';
				history.pushState(null, "", path);
			}
			break;

		case '/games/pong/waiting':
			if ((playerState === 'FRIEND_NAME_SELECTED' && gameMode === 'local') || (playerState === 'GAME_MODE_SELECTED' && gameMode === 'remote'))
				path = path;
			else {
				if (gameId)
					gameClient.wsConnectionsHandler.createAndSendMessages(game, 'BREAK', gameId, null);

				gameClient.reset();
				path = '/games/pong/game-mode';
				history.pushState(null, "", path);
			}
			break;

		case '/games/pong/game-play':
			if ((playerState === 'WAITING_MATCH') || (playerState === 'READY'))
				path = path;
			else {
				if (gameId)
					gameClient.wsConnectionsHandler.createAndSendMessages(game, 'BREAK', gameId, null);

				gameClient.reset();
				path = '/games/pong/game-mode';
				history.pushState(null, "", path);
			}
			break;
		
		default:
			break;
	}
	return path;
}

export function handlePongRoutes(path: string, app: HTMLElement) {
	let innerHTML: string | undefined

	if (path === '/games/pong') path = '/games/pong/game-mode';

	path = validateGameEntry(path);
	
	switch (path) {

		case '/games/pong/game-mode':
			innerHTML = renderGameModePage();
			if (!innerHTML)
				return ;

			app.innerHTML = innerHTML;
            setGameModeLogic();
            break;
		
		case '/games/pong/friend-name':
			innerHTML = renderFriendNamePage();
			if (!innerHTML)
				return ;

			app.innerHTML = innerHTML;
			setFriendNameLogic();
			setupHeaderLogic();
			break;
			
		case '/games/pong/waiting':
			// Waiting room
			innerHTML = renderWaitingPage();
			if (!innerHTML)
				return;
			app.innerHTML = innerHTML;
			setWaitingPageLogic();
			setupHeaderLogic();
			break;
		
		case '/games/pong/game-play':
			innerHTML = renderGamePlayPage();
			if (!innerHTML)
				return ;
			app.innerHTML = innerHTML;

			const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
			if (canvas) {
				setGamePlayPageLogic();
				setupHeaderLogic();
			}
			break;

		default:
			return "none";
	}
}
