export function renderSideBar() : string{
    return /* html */ `
        <aside class="w-20 flex flex-col items-center justify-center py-6 text-xl text-[#2A3FA1]">
          <nav class="flex flex-col gap-4">
            <a href="/home" data-link aria-label="Home" class="text-[#F2F2F2] w-10 h-10 flex items-center justify-center hover:text-white hover:scale-110 duration-200">
              <i class="fa-solid fa-house"></i>
            </a>

            <a href="/chat" data-link aria-label="chat" class="w-10 h-10 flex items-center justify-center hover:text-white hover:scale-105 duration-200">
              <i class="fa-regular fa-message"></i>
            </a>
            
            <a href="/profile" data-link aria-label="profile" class="w-10 h-10 flex items-center justify-center hover:text-white hover:scale-105 duration-200">
              <i class="fa-solid fa-user"></i>
            </a>
            
            <a href="/game" data-link aria-label="game" class="w-10 h-10 flex items-center justify-center hover:text-white hover:scale-105 duration-200">
              <i class="fa-solid fa-table-tennis-paddle-ball"></i>
            </a>
            <a href="/profiles" data-link aria-label="profiles" class="w-10 h-10 flex items-center justify-center hover:text-white hover:scale-105 duration-200">
              <i class="fa-solid fa-user-group"></i>          
            </a>

            <a href="/leaderBoard" data-link aria-label="Leader-board" class="w-10 h-10 flex items-center justify-center hover:text-white hover:scale-105 duration-200">
              <i class="fa-solid fa-trophy"></i>
            </a>
            
            <a href="/settings" data-link aria-label="Settings" class="w-10 h-10 flex items-center justify-center hover:text-white hover:scale-105 duration-200">
              <i class="fa-solid fa-gear"></i>
            </a>
          </nav>
        </aside>
    `
}