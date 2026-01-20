import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { setupchatlogic} from "../logic/chatlogic";

export function renderChat(): string {
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans">
      ${renderHeader()}
      <div class="flex flex-1 overflow-hidden">
        ${renderSideBar()}
        <section class="flex flex-col md:flex-row flex-1 p-8 -mt-6 gap-6 h-full">
          <div class="flex flex-col bg-[#2A3FA1] shadow-[-10px_-10px_0px_#441563] p-4 w-full md:w-1/3 lg:w-1/4 h-full">
            <div class="relative mt-5 w-full">
              <input id="contacts-search" class="focus:outline-none w-full rounded-full bg-[#441563] placeholder:text-white text-white pl-10 py-2" placeholder="Search" type="text"/>
            </div>
            <div id="contacts" class="mt-4 flex-1 overflow-y-auto"></div>
          </div>
          <div class="flex flex-col bg-[#2A3FA1] shadow-[-10px_-10px_0px_#441563] p-4 w-full md:flex-1 h-full relative">
            <div id="chat-placeholder" class="flex-1 flex flex-col items-center justify-center text-gray-400">
               <div class="w-20 h-20 flex items-center justify-center mb-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               </div>
               <p>Select a friend to start chatting</p>
            </div>
            <div id="active-chat-content" class="hidden flex flex-col flex-1 h-full">
              <div class="p-6 border-b border-purple-950 flex gap-5">
                <img id="header-avatar" src="" class="w-12 h-12 rounded-full border object-cover">
                <div class="flex flex-col text-cyan-50">
                  <h1 id="name-input"></h1>
                  <h2 id="online-status" class="text-xs"></h2>
                </div>
              </div>
              <ul id="message-container" class="flex-1 overflow-y-auto overflow-x-hidden mt-4 p-4"></ul>
              <div class="p-4 border-t border-purple-950 flex gap-2">
                <input id="chat-input" type="text" placeholder="Type a message..." class="flex-1 bg-[#441563] rounded-full px-4 py-2 focus:outline-none text-white">
                <button id="send-btn" class="bg-[#441563] px-6 py-2 rounded-full font-bold hover:bg-purple-500 transition-colors">Send</button>
                <button id="invite-btn" class="bg-[#441563] px-6 py-2 rounded-full font-bold hover:bg-purple-500 transition-colors">Invite</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>`;
}

export {setupchatlogic};