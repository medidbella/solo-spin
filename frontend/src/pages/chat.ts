import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { setupchatlogic} from "../logic/chatlogic.ts";

export function renderChat(): string {
return /* html */`
  <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
    ${renderHeader()}
    <div class="flex flex-1 overflow-hidden relative">
      ${renderSideBar()}
      
      <section class="flex flex-col md:flex-row flex-1 p-4 md:p-8 md:-mt-6 gap-6 h-full overflow-hidden pb-[72px] md:pb-0">
        
        <div id="contacts-container" class="flex flex-col bg-[#2A3FA1] shadow-none md:shadow-[-10px_-10px_0px_#441563] p-4 w-full md:w-1/3 lg:w-1/4 h-[40%] md:h-full overflow-hidden">
          <div id="contacts" class="mt-4 flex-1 overflow-y-auto"></div>
        </div>

        <div id="chat-window" class="flex flex-col bg-[#2A3FA1] shadow-none md:shadow-[-10px_-10px_0px_#441563] p-4 w-full md:flex-1 h-[60%] md:h-full relative">
          <div id="chat-placeholder" class="flex-1 flex flex-col items-center justify-center text-gray-400">
             <div class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
             </div>
             <p class="text-sm md:text-base">Select a friend to start chatting</p>
          </div>
          
          <div id="active-chat-content" class="hidden flex flex-col flex-1 h-full overflow-hidden">
            <div class="p-3 md:p-6 border-b border-purple-950 flex gap-3 md:gap-5 items-center shrink-0">
              <img id="header-avatar" src="" class="w-10 h-10 md:w-12 md:h-12 rounded-full border object-cover">
              <div class="flex flex-col text-cyan-50">
                <h1 id="name-input" class="text-sm md:text-base font-bold"></h1>
                <h2 id="online-status" class="text-[10px] md:text-xs"></h2>
              </div>
            </div>
            
            <ul id="message-container" class="flex-1 overflow-y-auto overflow-x-hidden mt-2 p-2 md:p-4"></ul>
            
            <div class="p-3 md:p-4 border-t border-purple-950 flex gap-2 shrink-0 bg-[#2A3FA1]">
              <input 
                id="chat-input" 
                type="text" 
                placeholder="Type a message..." 
                class="flex-1 bg-[#441563] rounded-full px-4 py-2 focus:outline-none text-white text-sm"
              >
              <button 
                id="send-btn" 
                class="bg-[#441563] px-4 md:px-6 py-2 rounded-full font-bold hover:bg-purple-500 transition-colors text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>`;
}

export {setupchatlogic};