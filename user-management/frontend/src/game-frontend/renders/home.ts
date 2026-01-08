
// import * as fs from 'fs'; // Import the file system module

import homeContent from '../pages/home.html?raw';

export function renderHomePage() {
    // const filePath: string = '../public/pages/home.ts';
    // let content: string | undefined;
    // try {
    //     // Read the file synchronously with 'utf-8' encoding
    //     content = fs.readFileSync(filePath, 'utf-8');
    //     // console.log("File content:", content);
    // } catch (error) {
    //     console.error("Error reading file:", error);
    // }
    // return content;

    return homeContent;
}