import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { apiFetch } from "../api_integration/api_fetch";
import type {UserInfo, UpdateUserRequest} from "../api_integration/api_types"


export async function settingsFormSubmit(ev:Event)
{
  ev.preventDefault();
  const nameInput = document.getElementById('settings-name') as HTMLInputElement;
  const usernameInput = document.getElementById('settings-username') as HTMLInputElement;
  const emailInput = document.getElementById('settings-email') as HTMLInputElement;

  const updateDataPayload:UpdateUserRequest = {
    email: emailInput.value.trim(),
    name: nameInput.value.trim(),
    username: usernameInput.value.trim()
  }

  try {
    const res:UserInfo = await apiFetch<UserInfo>("/api/user/update", {
      method: 'PATCH',
      body: JSON.stringify(updateDataPayload)
    })
    window.alert('user info successfully updated')
    const app = document.getElementById('app') as HTMLDivElement
    console.log(res)
    app.innerHTML = renderSettings(res)
    console.log("patched new data successfully")
  }
  catch(error:any)
  {
    console.log(`exception status phrase ${error.message}`, error)
    if (!('statusCode' in error))//not api related error 
      throw error
    else if (error.statusCode == 401)
      history.pushState(null, '', `/login?error=${encodeURIComponent("session expired please login again")}`);
    else if (error.statusCode == 400 || error.statusCode == 409)
      alert(error.message)
    else if (error.statusCode == 500){
      alert("server unexpected error please try again later")
    }
  }
}

export function renderSettings(user: UserInfo)
{
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
              <h2 class="text-2xl font-bold">${user.username}</h2>
              <p class="text-gray-300 text-sm mb-8">${user.name}</p>
              <div class="w-full  flex flex-col gap-3">
                <a href="/settings" data-link class="bg-[#f2f2f2] font-bold hover:scale-105 duration-300  text-[#441563] flex items-center gap-3 px-6 py-3 cursor-pointer rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Personal information
                </a>    
                <a href="/security" data-link class="bg-[#441563] rounded-full font-bold px-6 py-3 flex items-center gap-3 cursor-pointer hover:scale-105 duration-300 ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Security
                </a>
              </div>
            </div>
            <!-- second section -->
            <div class="col-span-8 bg-[#2A3FA1] h-full p-8 relative shadow-[-10px_-10px_0px_#441563]">
              <h3 class="text-2xl font-bold mb-8">Personal information:</h3>
              <form id="settings-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">name:</label>
                  <input id="settings-name" type="text" minLength=3 placeholder="${user.name}" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">User name:</label>
                  <input id="settings-username" type="text" minLength=4 placeholder="${user.username}" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold ml-1">Email:</label>
                  <input id="settings-email" type="email" placeholder="${user.email}" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="flex justify-end mt-12">
                  <button type=submit class="bg-[#233596] shadow-[-5px_-5px_0px_#441563] cursor-pointer text-white font-semibold py-3 px-8 hover:scale-105 duration-300">
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  `;
}