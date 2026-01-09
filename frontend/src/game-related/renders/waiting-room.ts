
// import * as fs from 'fs'; // Import the file system module

import waitingRoomContent from '../pages/waiting-room.html?raw';
// import waitingRoomContent from '../pages/waiting-room.html?raw';

export function renderWaitingRoomPage() {
	// const filePath: string = '../public/pages/waiting-room.html';
	// let content: string | undefined;
	// try {
	// 	// Read the file synchronously with 'utf-8' encoding
	// 	content = fs.readFileSync(filePath, 'utf-8');
	// 	// console.log("File content:", content);
	// } catch (error) {
	// 	console.error("Error reading file:", error);
	// }
	// return content;

	return waitingRoomContent;
}