
// 1. IMPORT YOUR VIEWS AND ITS LOGICS
import { renderSignUpPage, setupSignupLogic } from './game-related/renders/signup';
import { renderLoginPage, setUpLoginLogic } from './game-related/renders/login';
import { renderHomePage, setHomeLogic } from './game-related/renders/home'; // The "Start Play" page
// import { renderGameModePage } from './game-related/renders/game_mode'; // New: Choose Local/Remote
// import { renderPlayModePage } from './game-related/renders/play_mode'; // New: Choose Random/Friend
// import { renderFriendSetUpPage } from './game-related/renders/friend_setup'; // New: Enter Friend Name
// import { renderWaitingRoomPage } from './game-related/renders/waiting-room'; // New: Waiting Room
// import { renderGamePlayPage } from './game-related/renders/game_play'; // The actual game

import { handlePongRoutes } from './game-related/services/handle_pong_routes';
import { gameClient } from './game-related/services/game_client';


const app = document.getElementById('app') as HTMLDivElement;

function cleanUpGamePageIfRunAway(nextPath: string) {
	if (nextPath !== '/games/pong/game-play' && gameClient.canvas && !gameClient.getHasReseted()) {	
		// console.log(`  ===>>> HAS RESETED Condition: ${gameClient.getHasReseted} <<<====`);
		
		console.log("Navigating away from game. Resetting...");
		gameClient.reset();
	}
}

// 2. ROUTER FUNCTION
function router(path: string) {
	let innerHTML: string | undefined
	// app.innerHTML = ''; // Clear the current view

	// Clear view for root paths only (optional, depends on my preference)
    if (!path.startsWith('/games/')) {
        app.innerHTML = ''; 
    }

	cleanUpGamePageIfRunAway(path);

  	switch (true) {
    case path === '/':
        router('/signup');
		break;

    // --- USER MANAGEMENT (Temporary) ---
    case path === '/signup':
		innerHTML = renderSignUpPage();
		if (!innerHTML) {
			console.log(" ERROR: can't read the file, try again!!");
			router('./signup');
			break;
		}
    	app.innerHTML = innerHTML;
    	setupSignupLogic(); // Attaches event listeners for the form
    	break;

	case path === '/login':
		innerHTML = renderLoginPage();
		if (!innerHTML) {
			console.log(" ERROR: can't read the file, try again!!");
			router('./login');
			break;
		}
		app.innerHTML = innerHTML;
		setUpLoginLogic();
		break;

    // --- HOME: selecting the game (pong/sudoku) ---
    case path === '/home': 
    	// This is your "Start Play" page
		innerHTML = renderHomePage();
		if (!innerHTML) {
			console.log(" ERROR: can't read the file, try again!!");
			router('./home');
			break;
		}
    	app.innerHTML = innerHTML;
		setHomeLogic();
    	break;

    // --- GAME FLOW START ---
	case path.startsWith("/games/pong/"):
		// pong routes
		handlePongRoutes(path, app);
		break;

	// case path.startsWith("/games/sudoku/"):
	// 	innerHTML = handleSudokuRoutes(path);
	// 	if (innerHTML === 'none')
	// 		app.innerHTML = '<h1 class="text-white">404 - Page Not Found</h1>';
	// 	break;


    // case '/games/games/pong/game-mode':
    // 	// Choose Local vs Remote
	// 	innerHTML = renderGameModePage();
	// 	if (!innerHTML) {
	// 		console.log(" ERROR: can't read the file, try again!!");
	// 		router('./game-mode');
	// 		break
	// 	}
    // 	app.innerHTML = innerHTML;
    // 	break;

    // case '/games/pong/play-mode':
    // 	// Choose Friend vs Random
	// 	innerHTML = renderPlayModePage();
	// 	if (!innerHTML) {
	// 		console.log(" ERROR: can't read the file, try again!!");
	// 		router('./play-mode');
	// 		break
	// 	}
    // 	app.innerHTML = innerHTML;
    // 	break;

    // case '/games/pong/friend-match':
    // 	// Enter Friend's Name
	// 	innerHTML = renderFriendSetUpPage();
	// 	if (!innerHTML) {
	// 		console.log(" ERROR: can't read the file, try again!!");
	// 		router('./friend-match');
	// 		break
	// 	}
    // 	app.innerHTML = innerHTML;
    // 	break;

    // case '/games/pong/waiting-room':
    // 	// Waiting room
	// 	innerHTML = renderWaitingRoomPage();
	// 	if (!innerHTML) {
	// 		console.log(" ERROR: can't read the file, try again!!");
	// 		router('/games/pong/waiting-room');
	// 		break
	// 	}
    // 	app.innerHTML = innerHTML;
    // 	break;

    // case '/games/pong/game-play':
    // 	// The actual pong canvas
	// 	innerHTML = renderGamePlayPage();
	// 	if (!innerHTML) {
	// 		console.log(" ERROR: can't read the file, try again!!");
	// 		router('/games/pong/game-play');
	// 		break
	// 	}
    // 	app.innerHTML = innerHTML;
    // 	break;

    default:
    	app.innerHTML = '<h1 class="text-white">404 - Page Not Found</h1>';
  }
}

// 3. HANDLE BROWSER BACK BUTTON
window.addEventListener('popstate', () => {
    router(window.location.pathname);
});

// 4. GLOBAL NAVIGATION HANDLER
document.addEventListener('DOMContentLoaded', () => {
  
  	document.body.addEventListener('click', (e) => {
  	  	const target = e.target as HTMLElement;
  	  	const link = target.closest('a');
		
  	  	// Only intercept links with data-link attribute
  	  	if (link && link.hasAttribute('data-link')) {
  	  	    e.preventDefault(); 
  	  	    const href = link.getAttribute('href'); 

  	  	    if (href) {
  	  	        history.pushState(null, '', href); 
  	  	        router(href); 
  	  	    }
  	  	}
  	});

  	// Load initial page based on current URL
  	router(window.location.pathname);
});

export { router };

// notice that my teammate who's responsible for frontend set up something called components like header and side bar, i don't know 
