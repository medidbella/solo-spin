
// import * as fs from 'fs'; // Import the file system module
import gameModeContent from '../pages/game_mode.html?raw';

export function renderGameModePage() {
	// const filePath: string = '../public/pages/game_mode.html';
	// let content: string | undefined;
	// try {
	// 	// Read the file synchronously with 'utf-8' encoding
	// 	content = fs.readFileSync(filePath, 'utf-8');
	// 	// console.log("File content:", content);
	// } catch (error) {
	// 	console.error("Error reading file:", error);
	// }
	// return content;

	return gameModeContent;
}

// const content = renderGameModePage();
// console.log(content);