import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";


export function renderProfile(): string { 
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
      
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto p-8 relative">
            
            <h1 class="text-5xl text-red-700" >Profile Page in progress</h1>
        </section>
      </div>
    </main>
  `;
}