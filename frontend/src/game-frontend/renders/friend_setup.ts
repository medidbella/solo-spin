
// import * as fs from 'fs'; // Import the file system module

import friendSetUpContent from '../pages/friend_setup.html?raw';

export function renderFriendSetUpPage(): string | undefined {

	// const filePath: string = '../public/pages/friend_setup.html';
	// let content: string | undefined;
	// try {
	// 	// Read the file synchronously with 'utf-8' encoding
	// 	content = fs.readFileSync(filePath, 'utf-8');
	// 	// console.log("File content:", content);
	// } catch (error) {
	// 	console.error("Error reading file:", error);
	// }
	// return content;

	return friendSetUpContent;
}

// const content: string | undefined = renderFriendSetUp();
// console.log("File content:", content);