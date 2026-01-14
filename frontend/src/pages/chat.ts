import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";

export function renderChat(): string {
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans">
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        ${renderSideBar()}
        
      <section class="flex flex-col md:flex-row flex-1 p-8 -mt-6 gap-6 h-full">

        <div class="flex flex-col bg-[#2A3FA1] shadow-[-10px_-10px_0px_#441563] p-4 w-full md:w-1/3 lg:w-1/4 h-full">
        
          <div class="relative mt-5 w-full">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="18" height="18" viewBox="0 0 18 18" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.5 13C4.68333 13 3.146 12.3707 1.888 11.112C0.63 9.85333 0.000667196 8.316 5.29101e-07 6.5C-0.000666138 4.684 0.628667 3.14667 1.888 1.888C3.14733 0.629333 4.68467 0 6.5 0C8.31533 0 9.853 0.629333 11.113 1.888C12.373 3.14667 13.002 4.684 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L17.3 15.9C17.4833 16.0833 17.575 16.3167 17.575 16.6C17.575 16.8833 17.4833 17.1167 17.3 17.3C17.1167 17.4833 16.8833 17.575 16.6 17.575C16.3167 17.575 16.0833 17.4833 15.9 17.3L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13ZM6.5 11C7.75 11 8.81267 10.5627 9.688 9.688C10.5633 8.81333 11.0007 7.75067 11 6.5C10.9993 5.24933 10.562 4.187 9.688 3.313C8.814 2.439 7.75133 2.00133 6.5 2C5.24867 1.99867 4.18633 2.43633 3.313 3.313C2.43967 4.18967 2.002 5.252 2 6.5C1.998 7.748 2.43567 8.81067 3.313 9.688C4.19033 10.5653 5.25267 11.0027 6.5 11Z"
                fill="#F2F2F2"
              />
            </svg>
            <input
              id="contacts-search" class="focus:outline-none w-full rounded-full bg-[#441563]
                    placeholder:text-white text-white pl-10 py-2"
              placeholder="Search"
              type="text"/>
          </div>

          <div id="contacts" class="mt-4 flex-1 overflow-y-auto">
            Contacts list must be here
          </div>
        </div>

        <div class="flex flex-col bg-[#2A3FA1] shadow-[-10px_-10px_0px_#441563] p-4 w-full md:flex-1 h-full">
          <div class="p-6 border-b border-purple-950 flex gap-5">
            <img src="public/./../../public/imgs/person (1).png" class="w-12 h-12 rounded-full border">
            <div class="flex flex-col text-cyan-50">
              <h1 id="name-input">player name</h1>
              <h2 id="online-status" class="text-green-600">online</h2>
            </div>
          </div>
          <ul id="message-container" class="flex-1 overflow-y-auto overflow-x-hidden mt-4">
          </ul>
        </div>

      </section>
      </div>
    </main>
  `;
}