export function renderHeader() : string{
    return /* html */ `
        <header class="h-16 flex-none flex justify-between items-center px-1 py-10 z-10 relative">
          <img class="w-56 cursor-pointer object-contain" src="../../public/imgs/logo.png" alt="solo spin logo">
          <div class="flex gap-5 text-2xl pr-8">
            <button aria-label="notifications">
              <i class="fa-regular fa-bell text-[#2A3FA1] cursor-pointer hover:text-white hover:scale-105 duration-200"></i>
            </button>
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
    try{
      const response = await fetch('api/logout', {
        method: 'POST',
      });
      if (response.ok)
      {
        window.location.href = '/login'; //redirect my user to login and midbella handles the remove of tokens
      }
    }
    catch (error)
    {

    }
  });
}