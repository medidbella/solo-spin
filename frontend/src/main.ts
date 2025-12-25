import './style.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fontsource/teachers/400.css';

import { renderHome } from './pages/Home';
import { renderSettings } from './pages/Settings';
import { renderLandingPage }  from './pages/LandingPage';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignUpPage } from './pages/SignUpPage';
import { renderSecurity } from './pages/Security';
import { renderChat } from './pages/chat';

const app = document.getElementById('app') as HTMLDivElement;

function router() {
  const path = window.location.pathname;
  app.innerHTML = '';

  switch (path) {
    case '/':
      app.innerHTML = renderLandingPage();
      break;
    case '/login':
      app.innerHTML = renderLoginPage();
      break;
    case '/signup':
      app.innerHTML = renderSignUpPage();
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
    default:
      app.innerHTML = '<div class="text-center"><h1 class="text-3xl font-bold text-red-600">404 - Not Found</h1></div>';
  }
}

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (e) => {
    const target = e.target as HTMLAnchorElement;
    if (target.matches('#home-link, #settings-link')) {
      e.preventDefault();
      history.pushState(null, '', target.href);
      router();
    }
  });
  router();
});