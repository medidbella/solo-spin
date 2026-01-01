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
        <main class="flex-1 flex flex-col p-12 relative gap-6 h-full overflow-hidden">
          
          <!-- Hero Section (Top Half) -->
          <div class="relative bg-[#2A3FA1] flex items-center justify-between h-1/2 px-6 py-4 shadow-[-10px_-10px_0px_#441563]">
            <img class="w-1/4 object-contain origin-bottom h-[284px]" src="./../../public/imgs/orange-boy.png" alt="Orange Team Player">
            <div class="flex flex-col items-center text-[#F2F2F2] z-10">
              <h1 class="font-[solo] text-9xl md:text-9xl text-[#441563] opacity-80 mb-2 -mt-8">
                SoloSpin
              </h1>
              <div class="space-y-1 text-2xl md:text-xl font-light tracking-wide text-center">
                <p>DISCOVER THE PINGPONG</p>
                <p>WORLD EXPERIENCE</p>
                <p>JOIN US FOR A MATCH!</p>
              </div>
            </div>
            <img class="w-1/4 object-contain origin-bottom h-full" src="./../../public/imgs/SignUpimg.png" alt="Blue Team Player">
          </div>
          
          <!-- Game Modes Section (Bottom Half) -->
          <div class="flex-1 w-full flex gap-6">
            
            <!-- Quick Match Card -->
            <div class="flex justify-around items-center bg-[#2A3FA1] w-1/2 h-full shadow-[-10px_-10px_0px_#441563]">
              <article class="flex flex-col items-center text-[#F2F2F2] gap-5">
                <h2 class="text-7xl text-center text-[#441563] font-[solo] ">Ready to play?</h2>
                <div class="text-xl font-light text-center">
                  <p>Join a quick match to test your</p>
                  <p>skills against other players</p>
                </div>
                <button class="bg-black font-[solo] text-3xl text-[#441563] w-2/3 shadow-[5px_-5px_0px_#441563] cursor-pointer hover:scale-105 hover:text-[#f2f2f2] duration-300">PLAY</button>
              </article>
              <img class="w-6/12 object-contain" src="../../public/imgs/table 1.png" alt="ping pong table">
            </div>
            
            <!-- Private Lobby Card -->
            <div class="w-1/2 h-full bg-[#2A3FA1] flex justify-around items-center shadow-[-10px_-10px_0px_#441563] ">
              <article class="flex flex-col items-center text-[#f2f2f2] gap-6">
                <h2 class="font-[solo] text-[#441563] text-7xl">Play with freinds</h2>
                <div class="text-xl font-light text-center">
                  <p>Create a private lobby challenge your rivals</p>
                  <p>and battle for the championship cup</p>
                </div>
                <button class="bg-black w-2/3 text-[#441563] shadow-[5px_-5px_0px_#441563] font-[solo] text-5xl cursor-pointer hover:scale-105 hover:text-[#f2f2f2] duration-300">JOIN</button>
              </article>
              <img src="../../public/imgs/trophy.png" alt="trophy">
            </div>
          </div>
        </main>
      </div>
    </main>
  `;
}