
// import * as fs from 'fs'; // Import the file system module
import gamePlayContent from '../pages/game_play.html?raw';

export function renderGamePlayPage() {
	// const filePath: string = '../public/pages/game_play.html';
	// let content: string | undefined;
	// try {
	// 	// Read the file synchronously with 'utf-8' encoding
	// 	content = fs.readFileSync(filePath, 'utf-8');
	// 	// console.log("File content:", content);
	// } catch (error) {
	// 	console.error("Error reading file:", error);
	// }
	// return content;

	return gamePlayContent;
}