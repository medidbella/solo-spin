import './style.css';
import '@fortawesome/fontawesome-free/css/all.css';

// This ensures the singleton is created in memory
import { gameClient } from "./game-related/services/game_client.ts";
gameClient as any;

import { handlePongRoutes } from './game-related/services/handle_pong_routes';

import { renderHome, setupSearchLogic } from './pages/Home';
import { renderSettings, setupSettingPageLogic} from './pages/Settings';
import { renderLandingPage }  from './pages/LandingPage';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignUpPage } from './pages/SignUpPage';
import { renderSecurity} from './pages/Security';
import { renderChat, setupchatlogic } from './pages/chat';
import { renderLeaderBoard } from './pages/leaderBoard';
// import { renderGamePage } from './pages/game';
import { renderProfile } from './pages/Profile';
import { renderProfilesPage, setupProfilesPageLogic } from './pages/profiles';
import { setupSignupLogic } from './pages/SignUpPage';
import { setUpLoginLogic } from './pages/LoginPage';
import { setupHeaderLogic } from './components/Header.ts';
import { apiFetch } from './api_integration/api_fetch';
import type { UserInfo } from './api_integration/api_types';
import { redirectBasedOnAuth } from './utils/auth.ts';
import { setupSecurityPageLogic } from './pages/Security';
import { showAlert } from './utils/alert.ts';
const app = document.getElementById('app') as HTMLDivElement;

export const routeStatesMap: Record<string, 'private' | 'public'> = {
  '/'            			: 'public',
  '/login'       			: 'public',
  '/signup'      			: 'public',
  '/home'        			: 'private',
  '/settings'    			: 'private',
  '/security'    			: 'private',
  '/chat'        			: 'private',
  '/game'        			: 'private',
  '/leaderboard' 			: 'private',
  '/profile'     			: 'private',
  '/profiles'    			: 'private',
  '/games/pong/game-mode'	: 'private',
  '/games/pong/friend-name'	: 'private',
  '/games/pong/waiting'		: 'private',
  '/games/pong/game-play'	: 'private'
};

export async function router(path: string): Promise<string>
{  
	path = await redirectBasedOnAuth(path);
	
	console.log(`  next path: ${path} || Has Started: ${gameClient.getHasStarted()}`);
	gameClient.handleMidGameNavigate(path);

	switch (true) {
		case path == '/':
			app.innerHTML = renderLandingPage();
			break;
			
		case path == '/login':
			app.innerHTML = renderLoginPage();
			setUpLoginLogic();
			break;
			
		case path == '/signup':
			 app.innerHTML = renderSignUpPage(); 
			 setupSignupLogic();
			 break;

		case path == '/home':
			app.innerHTML = renderHome();
			setupHeaderLogic();
			setupSearchLogic();
			break;
			
		case path == '/settings':
			try {
				const userInfo = await apiFetch<UserInfo>("/api/basic-info")
				app.innerHTML = renderSettings(userInfo);
				setupSettingPageLogic();
			}
			catch (error: any) {
				console.log('Failed fetching settings:', error);
				if (error.message == "Failed to fetch"){
					showAlert('server error please try again later', "error");
				}
				else {
					console.log(error.message)
					history.pushState(null, '', `/login?error=${encodeURIComponent(error.message
							|| 'unexpected error please login again')}`);
					router('/login');
					return path;
				}
			}
			setupHeaderLogic();
			break;
			
		case path == '/security':
			try {
				const userInfo = await apiFetch<UserInfo>("/api/basic-info")
				app.innerHTML = renderSecurity(userInfo);
				// Use the new combined setup function instead of individual listener
				setupSecurityPageLogic();
			}
			catch (error: any) {
				if (error.message == "Failed to fetch"){
					showAlert('server error please try again later', "error");
				}
				else {
					console.log(error.message)
					history.pushState(null, '', `/login?error=${encodeURIComponent(error.message
							|| 'unexpected error please login again')}`);
					router('/login');
					return path;
				}
			}
			setupHeaderLogic();
			break;
			
		case path == '/chat':
			app.innerHTML = renderChat();
			setupHeaderLogic();
			setupchatlogic();
			break;
			
		case path == '/leaderBoard':
				app.innerHTML = '<div class="flex h-screen items-center justify-center text-white"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>';
				try {
					const leaderboardHtml = await renderLeaderBoard();
					app.innerHTML = leaderboardHtml;
				} 
				catch (error: any)
				{
					console.error("Failed to load leaderboard", error);
					if (error.message === "Failed to fetch") {
						app.innerHTML = '<div class="text-red-500 text-center mt-20">Server error. Please try again later.</div>';
					} else {
						app.innerHTML = '<div class="text-red-500 text-center mt-20">Error loading leaderboard</div>';
					}
				}
				setupHeaderLogic();
				break;

		case path == '/profile':
			app.innerHTML = '<div class="flex h-screen items-center justify-center text-white"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>';
			try {
				const profileHtml = await renderProfile(); 
				app.innerHTML = profileHtml;
			} catch (error) {
				console.error("Failed to load profile", error);
				app.innerHTML = '<div class="text-red-500 text-center mt-20">Error loading profile</div>';
			}
			setupHeaderLogic();
			break;

		case path == '/profiles':
			app.innerHTML = renderProfilesPage();
			setupProfilesPageLogic();
			setupHeaderLogic();
			break;

		 // --- GAME FLOW START ---
		case path.startsWith("/games/pong"):
			handlePongRoutes(path, app);
			break;

		default:
			app.innerHTML = '<div class="text-center mt-20"><h1 class="text-3xl font-bold text-red-600">404 - Not Found</h1><a href="/" data-link class="text-white underline">Go Home</a></div>';
	}
	return path;
}

window.addEventListener('popstate', () => {
		router(window.location.pathname);
});

document.addEventListener('DOMContentLoaded', () => {
  
  document.body.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (link && link.hasAttribute('data-link')) {
        e.preventDefault();
        
        const href = link.getAttribute('href');
        
        if (href) {
            history.pushState(null, '', href);
            router(href);
        }
    }
  });
  
	(async () => {
		const resolvedPath = await router(window.location.pathname);
		gameClient.protectGameWSUpdates(resolvedPath);
	})();

});

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}