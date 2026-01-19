import './style.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { renderHome } from './pages/Home';
import { renderSettings, settingsFormSubmit} from './pages/Settings';
import { renderLandingPage }  from './pages/LandingPage';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignUpPage } from './pages/SignUpPage';
import { renderSecurity, changePasswordFormSubmit} from './pages/Security';
import { renderChat } from './pages/chat';
import { renderLeaderBoard } from './pages/leaderBoard';
import { renderGamePage } from './pages/game';
import { renderProfile } from './pages/Profile';
import { renderProfilesPage } from './pages/profiles';
import { setupSignupLogic } from './pages/SignUpPage';
import { setUpLoginLogic } from './pages/LoginPage';
import { setupHeaderLogic } from './components/Header.ts';
import { apiFetch } from './api_integration/api_fetch';
import type { UserInfo } from './api_integration/api_types';
import { redirectBasedOnAuth } from './utils/auth.ts';
import { setupSecurityPageLogic } from './pages/Security';
import { render_2fa } from './pages/2fa.ts';
const app = document.getElementById('app') as HTMLDivElement;

export const routeStatesMap: Record<string, 'private' | 'public'> = {
  '/'            : 'public',
  '/login'       : 'public',
  '/signup'      : 'public',
  '/home'        : 'private',
  '/settings'    : 'private',
  '/security'    : 'private',
  '/chat'        : 'private',
  '/game'        : 'private',
  '/leaderboard' : 'private',
  '/profile'     : 'private',
  '/profiles'    : 'private',
  '/2fa'         : 'public'
};

export async function router(path: string)
{  
  path = await redirectBasedOnAuth(path)
  switch (path) {
    case '/':
      app.innerHTML = renderLandingPage();
      break;
      
    case '/login':
      app.innerHTML = renderLoginPage();
      setUpLoginLogic();
      break;
      
    case '/signup':
       app.innerHTML = renderSignUpPage(); 
       setupSignupLogic();
       break;
    case '/2fa':
        app.innerHTML = render_2fa();
        break;  
    case '/home':
      app.innerHTML = renderHome();
      setupHeaderLogic();
      break;
      
    case '/settings':
      try {
        const userInfo = await apiFetch<UserInfo>("/api/basic-info")
        app.innerHTML = renderSettings(userInfo);
        const settingsFrom = document.getElementById('settings-form')
        if (settingsFrom)
          settingsFrom.addEventListener('submit', settingsFormSubmit)
      }
      catch (error: any) {
        console.log('Failed fetching settings:', error);
        if (error.message == "Failed to fetch"){
          alert('server error please try again later')
        }
        else {
          console.log(error.message)
          history.pushState(null, '', `/login?error=${encodeURIComponent(error.message)}`);
          router('/login');
          return;
        }
      }
      setupHeaderLogic();
      break;
      
    case '/security':
      try {
        const userInfo = await apiFetch<UserInfo>("/api/basic-info")
        app.innerHTML = renderSecurity(userInfo);
        // Use the new combined setup function instead of individual listener
        setupSecurityPageLogic();
      }
      catch (error: any) {
        if (error.message == "Failed to fetch"){
          alert('server error please try again later')
        }
        else {
          console.log(error.message)
          history.pushState(null, '', `/login?error=${encodeURIComponent(error.message)}`);
          router('/login');
          return;
        }
      }
      setupHeaderLogic();
      break;
      
    case '/chat':
      app.innerHTML = renderChat();
      setupHeaderLogic();
      break;
      
    case '/leaderBoard':
        app.innerHTML = renderLeaderBoard();
        setupHeaderLogic();
        break;
        
    case '/game':
      app.innerHTML = renderGamePage();
      setupHeaderLogic();
      break;

    case '/profile':
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

    case '/profiles':
      app.innerHTML = renderProfilesPage();
      setupHeaderLogic();
      break;

    default:
      app.innerHTML = '<div class="text-center mt-20"><h1 class="text-3xl font-bold text-red-600">404 - Not Found</h1><a href="/" data-link class="text-white underline">Go Home</a></div>';
  }
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

  
  router(window.location.pathname);
});