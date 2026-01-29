import { router } from "../main";
import { gameClient } from '../game-related/services/game_client';

export function renderHeader() : string{
    return /* html */ `
        <header class="h-16 flex-none flex justify-between items-center px-1 py-10 z-10 relative">
          <a href="/home" data-link>
            <img class="w-56 cursor-pointer object-contain" src="../../public/imgs/logo.png" alt="solo spin logo">
          </a>
          <div class="flex gap-5 text-2xl pr-8">
            <button id="logoutButton" aria-label="logout">
              <i class="fa-solid fa-arrow-right-from-bracket text-[#2A3FA1] cursor-pointer hover:text-white hover:scale-105 duration-200"></i>
            </button>
          </div>
        </header>
    `;
}

export function setupHeaderLogic() : void
{
  const logoutBtn = document.getElementById("logoutButton");
  const playBtn = document.getElementById('btn-play-home');

  if (!logoutBtn || !playBtn) return;

  if (playBtn) {
    playBtn.addEventListener('click', () => {
        console.log("🚀 User clicked Play");

        // 1. Optional: Reset any old game state to be safe
        gameClient.reset();

        // 2. Navigate to the Game Page
        // This triggers the router, which renders renderGamePage()
        history.pushState(null, '', '/games/pong/game-mode');
        router('/games/pong/game-mode');
    });
  }

  logoutBtn.addEventListener('click', async() => {
    try{
      const response = await fetch('api/logout', {
        method: 'POST',
      });
      if (response.ok)
      {
        history.pushState(null, '', '/login'); //redirect my user to login and midbella handles the remove of token
        router('/login');
      }
    }
    catch (error)
    {
      console.error('Logout failed: ', error);
    }
  });
}