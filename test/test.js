"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderGameModePage = renderGameModePage;
// import * as fs from 'fs'; // Import the file system module
var game_mode_html_raw_1 = require("../frontend/src/game-frontend/pages/game_mode.html?raw");
function renderGameModePage() {
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
    return game_mode_html_raw_1.default;
}
var content = renderGameModePage();
console.log(content);
