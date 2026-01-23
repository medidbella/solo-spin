import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";

export function renderHome(): string {
  return /* html */`
    <!-- Main Container -->
    <main class="h-screen flex flex-col">
      ${renderHeader()}
      
      <!-- Content Wrapper: Sidebar + Main Content -->
      <div class="flex flex-1 overflow-hidden">
        ${renderSideBar()}
        
        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col p-12 relative gap-4 h-full overflow-hidden">
          <!-- Search Bar -->
          <div class="w-full flex justify-center shrink-0=">
            <div class="relative w-1/2">
              <input 
                type="text" 
                id="search-input"
                placeholder="Search for a player by username..." 
                class="w-full px-4 py-3 pl-12 bg-[#1a1a2e] text-[#F2F2F2] rounded-lg border-2 border-[#441563] focus:outline-none focus:border-[#2A3FA1] placeholder-gray-400"
              />
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <!-- Hero Section -->
          <div class="relative bg-[#2A3FA1] flex items-center justify-between flex-[4] min-h-0 px-6 py-4 shadow-[-10px_-10px_0px_#441563]">
            <img class="h-full max-w-[25%] object-contain" src="./../../public/imgs/orange-boy.png" alt="Orange Team Player">
            <div class="flex flex-col items-center text-[#F2F2F2] z-10">
              <h1 class="font-[solo] text-7xl lg:text-9xl text-[#441563] opacity-80 mb-2">
                SoloSpin
              </h1>
              <div class="space-y-1 text-lg md:text-xl font-light tracking-wide text-center">
                <p>DISCOVER THE PINGPONG</p>
                <p>WORLD EXPERIENCE</p>
                <p>JOIN US FOR A MATCH!</p>
              </div>
            </div>
            <img class="h-full max-w-[25%] object-contain" src="./../../public/imgs/SignUpimg.png" alt="Blue Team Player">
          </div>
          
          <!-- Game Modes Section -->
          <div class="flex-3 min-h-0 w-full flex gap-6">
            <!-- Quick Match Card -->
            <div class="flex justify-around items-center bg-[#2A3FA1] w-full h-full shadow-[-10px_-10px_0px_#441563] p-4">
              <article class="flex flex-col items-center text-[#F2F2F2] gap-3">
                <h2 class="text-4xl lg:text-6xl text-center text-[#441563] font-[solo]">Ready to play?</h2>
                <div class="text-base lg:text-xl font-light text-center">
                  <p>Join a quick match to test your</p>
                  <p>skills against other players</p>
                </div>
                <button class="bg-black font-[solo] text-2xl lg:text-3xl text-[#441563] px-8 py-2 shadow-[5px_-5px_0px_#441563] cursor-pointer hover:scale-105 hover:text-[#f2f2f2] duration-300">PLAY</button>
              </article>
              <img class="h-full max-w-[45%] object-contain" src="../../public/imgs/table 1.png" alt="ping pong table">
            </div>
          </div>
        </main>
      </div>
    </main>
  `;
}