
// import * as fs from 'fs'; // Import the file system module

import playModeContent from '../pages/play_mode.html?raw';

export function renderPlayModePage() {
	// const filePath: string = '../public/pages/play_mode.html';
	// let content: string | undefined;
	// try {
	// 	// Read the file synchronously with 'utf-8' encoding
	// 	content = fs.readFileSync(filePath, 'utf-8');
	// 	// console.log("File content:", content);
	// } catch (error) {
	// 	console.error("Error reading file:", error);
	// }
	// return content;

	return playModeContent;

}