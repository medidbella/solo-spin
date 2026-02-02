import { router } from "../main";

export function renderHeader() : string{
  return /* html */ `
  <header class="h-16 flex-none flex justify-between items-center px-4 lg:px-8 py-8 lg:py-10 z-20 relative">
    <a href="/home" data-link>
      <img class="w-40 lg:w-56 cursor-pointer object-contain" src="../../public/imgs/logo.png" alt="solo spin logo">
    </a>
    <div class="flex gap-4 lg:gap-5 text-xl lg:text-2xl pr-2 lg:pr-8">
    
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

  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async() => {
    console.log('logout button is clicked')
    try {
      const response = await fetch('/api/logout', {
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