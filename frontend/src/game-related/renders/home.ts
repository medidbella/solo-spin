
import homeContent from '../pages/home.html?raw';
import { gameClient } from '../services/game_client';

import { router } from '../../main';

function renderHomePage() {
	return homeContent;
}

function setHomeLogic() {

	const playPongBtn = document.getElementById('playPongBtn') as HTMLButtonElement;
	const playSudokuBtn = document.getElementById('playSudokuBtn') as HTMLButtonElement;
	const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
	const userAliasSpan = document.getElementById('userAlias') as HTMLSpanElement;

	if (!playPongBtn || !playSudokuBtn || !errorMessage) { return; }

	if (userAliasSpan) {
        userAliasSpan.innerText = gameClient.getPlayerName() as string; 
    }

	// 1. Pong Game event listener
	playPongBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Pong Game');
		gameClient.setGame('pong');
		// MOVED INSIDE: Navigate immediately after setting state
        router('/games/pong/game-mode');
	});

	// 2. Sudoku Game event listener
	playSudokuBtn.addEventListener('click', () => {
		console.log('🎮 User selected: Sudoku Game');
		gameClient.setGame('sudoku');
		// MOVED INSIDE: Logic for Sudoku
        console.log("   No routes For Sudoku At The Moment !!");
	});
}

export { renderHomePage, setHomeLogic };