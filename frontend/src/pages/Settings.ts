import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";

export function renderSettings(): string {
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans">
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto relative p-8 -mt-6">
          
          <h1 class="text-6xl  text-center font-bold mb-12 tracking-widest font-[solo]">
            Settings
          </h1>

          <div class="max-w-7xl w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-2">
            <!-- first section -->
            <div class="lg:col-span-4 bg-[#2A3FA1] p-6 flex flex-col items-center  relative h-full shadow-[-10px_-10px_0px_#441563]">
              <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-[#441563]">
                <img class="w-full h-full object-cover" src="../../public/imgs/person.svg" alt="">
              </div>
              <h2 class="text-2xl font-bold">Aakouhar</h2>
              <p class="text-gray-300 text-sm mb-8">Full name Full name Full name</p>
              <div class="w-full  flex flex-col gap-3">
                <button class="bg-[#f2f2f2] font-bold hover:scale-105 duration-300  text-[#441563] flex items-center gap-3 px-6 py-3 cursor-pointer rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Personal information
                </button>    
                <button class="bg-[#441563] rounded-full font-bold px-6 py-3 flex items-center gap-3 cursor-pointer hover:scale-105 duration-300 ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Security
                </button>
              </div>
            </div>
            <!-- second section -->
            <div class="col-span-8 bg-[#2A3FA1] h-full p-8 relative shadow-[-10px_-10px_0px_#441563]">
              <h3 class="text-2xl font-bold mb-8">Personal information:</h3>
              <form class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">First name:</label>
                  <input type="text" placeholder="your first name" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">Last name:</label>
                  <input type="text" placeholder="your last name" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">User name:</label>
                  <input type="text" placeholder="your user name" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">Email:</label>
                  <input type="email" placeholder="your email" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">Age:</label>
                  <input type="number" placeholder="23" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">Gender:</label>
                  <select class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm text-gray-300 outline-none transition-all appearance-none">
                    <option>male</option>
                    <option>female</option>
                  </select>
                </div>
              </form>
              <div class="flex justify-end mt-12">
                <button class="bg-[#233596] shadow-[-5px_-5px_0px_#441563] cursor-pointer text-white font-semibold py-3 px-8 hover:scale-105 duration-300">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  `;
}