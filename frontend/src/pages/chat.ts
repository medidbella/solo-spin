import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";

export function renderChat(): string {
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans">
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto relative p-8 -mt-6">
          <!-- write your chat code here -->
        </section>
      </div>
    </main>
  `;
}