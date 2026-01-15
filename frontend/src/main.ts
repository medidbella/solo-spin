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
import { apiFetch } from './api_integration/api_fetch';
import type { UserInfo } from './api_integration/api_types';

const app = document.getElementById('app') as HTMLDivElement;


export async function router(path: string) {
  

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
       
    case '/home':
      app.innerHTML = renderHome();
      break;
      
    case '/settings':
      try {
        const userInfo = await apiFetch<UserInfo>("/api/personal-info")
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
      break;
      
    case '/security':
      try {
        const userInfo = await apiFetch<UserInfo>("/api/personal-info")
        app.innerHTML = renderSecurity(userInfo);
        const newPasswordForm = document.getElementById('new-password-form')
        if (newPasswordForm)
          newPasswordForm.addEventListener('submit', changePasswordFormSubmit)
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
      break;      
    case '/chat':
      app.innerHTML = renderChat();
      break;
      
    case '/leaderBoard':
        app.innerHTML = renderLeaderBoard();
        break;
        
    case '/game':
      app.innerHTML = renderGamePage();
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
      break;

    case '/profiles':
      app.innerHTML = renderProfilesPage();
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