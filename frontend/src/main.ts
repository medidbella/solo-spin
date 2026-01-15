import './style.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { renderHome } from './pages/Home';
import { renderSettings } from './pages/Settings';
import { renderLandingPage }  from './pages/LandingPage';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignUpPage } from './pages/SignUpPage';
import { renderSecurity } from './pages/Security';
import { renderChat } from './pages/chat';
import { renderLeaderBoard } from './pages/leaderBoard';
import { renderGamePage } from './pages/game';
import { renderProfile } from './pages/Profile';
import { renderProfilesPage } from './pages/profiles';
import { setupSignupLogic } from './pages/SignUpPage';
import { setUpLoginLogic } from './pages/LoginPage';
import { setupHeaderLogic } from './components/Header.ts';
import { requireAuth, requirGuest } from './utils/auth.ts';

const app = document.getElementById('app') as HTMLDivElement;


async function router(path: string) {
  

  switch (path) {
    //public pages for Guests (landing login and signup pages)
    case '/':
      if (!await requirGuest()) //return true if the user has not the access to public pages because he is alreadu authenticated so i will redirect the user to home page
        return router('/home');
      app.innerHTML = renderLandingPage();
      break;
      
    case '/login':
      if (!await requirGuest())
        return router('/home');
      app.innerHTML = renderLoginPage();
      setUpLoginLogic();
      break;
      
    case '/signup':
       if (!await requirGuest())
        return router('/home');
       app.innerHTML = renderSignUpPage(); 
       setupSignupLogic();
       break;
       
    case '/home':
      if (!await requireAuth())
          return router('/login');
      app.innerHTML = renderHome();
      setupHeaderLogic();
      break;
      
    case '/settings':
      if (!await requireAuth())
          return router('/login');
      app.innerHTML = renderSettings();
      setupHeaderLogic();
      break;
      
    case '/security':
      if (!await requireAuth())
          return router('/login');
      app.innerHTML = renderSecurity();
      setupHeaderLogic();
      break;
      
    case '/chat':
      if (!await requireAuth())
          return router('/login');
      app.innerHTML = renderChat();
      setupHeaderLogic();
      break;
      
    case '/leaderBoard':
      if (!await requireAuth())
          return router('/login');
        app.innerHTML = renderLeaderBoard();
        setupHeaderLogic();
        break;
        
    case '/game':
      if (!await requireAuth())
          return router('/login');
      app.innerHTML = renderGamePage();
      setupHeaderLogic();
      break;

    case '/profile':
      if (!await requireAuth())
          return router('/login');
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
      if (!await requireAuth())
          return router('/login');
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