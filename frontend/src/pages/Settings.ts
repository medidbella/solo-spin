import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { apiFetch } from "../api_integration/api_fetch";
import type {UserInfo, UpdateUserRequest} from "../api_integration/api_types"
import { showAlert } from "../utils/alert";


async function settingsFormSubmit(ev:Event)
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
    showAlert('user info successfully updated', "success");
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
      showAlert(error.message, "error");
    else if (error.statusCode == 500){
      showAlert("server unexpected error please try again later", "error");
    }
  }
}

export async function avatarUpload(ev:Event)
{
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.type !== 'image/png') {
        showAlert("Only PNG files are allowed.", "error");
        input.value = "";
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    try
    {
        await apiFetch('/api/user/avatar', {
            method: 'POST',
            body: formData,
        });
    }
    catch (error: any) {
      console.log(error.message)
      showAlert(error.message, "error");
    }
}

export async function setupSettingPageLogic()
{
  const settingsFrom = document.getElementById('settings-form')
  const avatarUploadButton = document.getElementById('avatar-upload')
  if (settingsFrom)
		settingsFrom.addEventListener('submit', settingsFormSubmit)
  if (avatarUploadButton)
    avatarUploadButton.addEventListener('change', avatarUpload)
}

export function renderSettings(user: UserInfo)
{
  return /* html */`
  <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
    ${renderHeader()}
    
    <div class="flex flex-1 overflow-hidden relative">
      ${renderSideBar()}
      
      <section class="flex-1 overflow-y-auto relative p-4 md:p-8 md:-mt-6 pb-24 md:pb-8">
        
        <h1 class="text-4xl md:text-6xl text-center font-bold mb-8 md:mb-12 tracking-widest font-[solo]">
          Settings
        </h1>

        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div class="lg:col-span-4 bg-[#2A3FA1] p-6 flex flex-col items-center relative h-fit lg:h-full shadow-[-6px_-6px_0px_#441563] md:shadow-[-10px_-10px_0px_#441563]">
            <div class="relative group mb-4"> 
              <div class="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#441563]">
                <img class="w-full h-full object-cover" src="/api/user/avatar" alt="the user avatar" onerror="this.src='/imgs/default-avatar.png'">
              </div>

              <label for="avatar-upload" class="absolute bottom-1 right-1 bg-[#441563] p-2 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 border-[#2A3FA1] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <input type="file" id="avatar-upload" class="hidden" accept="image/png">
              </label>
            </div>
            
            <h2 class="text-xl md:text-2xl font-bold truncate w-full text-center">${user.username}</h2>
            <p class="text-gray-300 text-xs md:text-sm mb-6 md:mb-8 truncate w-full text-center">${user.name}</p>
            
            <div class="w-full flex flex-col gap-3">
              <a href="/settings" data-link class="bg-[#f2f2f2] font-bold hover:scale-105 duration-300 text-[#441563] flex items-center gap-3 px-6 py-3 cursor-pointer rounded-full text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Personal information
              </a>    
              <a href="/security" data-link class="bg-[#441563] rounded-full font-bold px-6 py-3 flex items-center gap-3 cursor-pointer hover:scale-105 duration-300 text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Security
              </a>
            </div>
          </div>

          <div class="lg:col-span-8 bg-[#2A3FA1] h-fit p-6 md:p-8 relative shadow-[-6px_-6px_0px_#441563] md:shadow-[-10px_-10px_0px_#441563]">
            <h3 class="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center md:text-left">Personal information:</h3>
            
            <form id="settings-form" class="flex flex-col gap-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-xs md:text-sm font-semibold ml-1">Name:</label>
                  <input id="settings-name" type="text" minLength="3" placeholder="${user.name}" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2">
                  <label class="block text-xs md:text-sm font-semibold ml-1">Username:</label>
                  <input id="settings-username" type="text" minLength="4" placeholder="${user.username}" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="block text-xs md:text-sm font-semibold ml-1">Email:</label>
                  <input id="settings-email" type="email" placeholder="${user.email}" class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                </div>
              </div>

              <div class="flex justify-center md:justify-end mt-4">
                <button type="submit" class="w-full md:w-auto bg-[#233596] shadow-[-4px_-4px_0px_#441563] md:shadow-[-5px_-5px_0px_#441563] cursor-pointer text-white font-semibold py-3 px-8 hover:scale-105 active:scale-95 duration-300">
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