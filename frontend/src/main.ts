import './style.css';
import { renderHome } from './pages/Home';
import { renderSettings } from './pages/Settings';
import { renderLandingPage }  from './pages/LandingPage';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignUpPage } from './pages/SignUpPage';
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