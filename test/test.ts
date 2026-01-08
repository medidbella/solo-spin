
// import * as fs from 'fs'; // Import the file system module
import gameModeContent from '../frontend/src/game-frontend/pages/game_mode.html?raw';

export function renderGameModePage() {


	return gameModeContent;
}

const content = renderGameModePage();
console.log(content);