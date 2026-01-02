import './style.css';
import '@fortawesome/fontawesome-free/css/all.css';
// import fonts ...

// Import pages
import { renderHome } from './pages/Home';
import { renderSettings } from './pages/Settings';
import { renderLandingPage }  from './pages/LandingPage';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignUpPage } from './pages/SignUpPage'; // Dir had page ila mazal madrtiha
import { renderSecurity } from './pages/Security';
import { renderChat } from './pages/chat';
import { renderLeaderBoard } from './pages/leaderBoard';
import { renderGamePage } from './pages/game';
import { renderProfile } from './pages/Profile';
import { renderProfilesPage } from './pages/profiles';


const app = document.getElementById('app') as HTMLDivElement;

// 1. ROUTER FUNCTION
function router(path: string) {
  app.innerHTML = ''; // N9iw l page

  switch (path) {
    case '/':
      app.innerHTML = renderLandingPage();
      break;
    case '/login':
      app.innerHTML = renderLoginPage();
      break;
    case '/signup':
       app.innerHTML = renderSignUpPage(); 
      //  app.innerHTML = `<h1 class='text-white'>Sign Up Page (Coming Soon)</h1>`; // Placeholder
       break;
    case '/home':
      app.innerHTML = renderHome();
      break;
    case '/settings':
      app.innerHTML = renderSettings();
      break;
    case '/security':
      app.innerHTML = renderSecurity();
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
      app.innerHTML = renderProfile();
      break;
    case '/profiles':
      app.innerHTML = renderProfilesPage();
      break;
    default:
      app.innerHTML = '<div class="text-center mt-20"><h1 class="text-3xl font-bold text-red-600">404 - Not Found</h1><a href="/" data-link class="text-white underline">Go Home</a></div>';
  }
}

// 2. HANDLE BROWSER BACK BUTTON
window.addEventListener('popstate', () => {
    router(window.location.pathname);
});

// 3. GLOBAL EVENT LISTENER (The Senior Fix) 🛠️
document.addEventListener('DOMContentLoaded', () => {
  
  document.body.addEventListener('click', (e) => {
    // A. Jib element li tclicka (target)
    const target = e.target as HTMLElement;

    // B. L'Trick: Wach had target howa <a> AW wst chi <a> ?
    // closest('a') kay9llb 3la a9rab parent howa <a>.
    // Hada kiy7ll mochkil icons <i> 
    const link = target.closest('a');

    // C. Check: Wach l9ina link? O wach fih 'data-link'?
    if (link && link.hasAttribute('data-link')) {
        e.preventDefault(); // 1. 7bs reload
        
        const href = link.getAttribute('href'); // 2. Jib lien (/home)
        
        if (href) {
            history.pushState(null, '', href); // 3. Bddl URL lfo9
            router(href); // 4. Afficher page jdida
        }
    }
  });

  // Load initial page
  router(window.location.pathname);
});