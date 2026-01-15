import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import type { UserInfo, GeneralSuccessRes, UpdatePasswordRequest} from '../api_integration/api_types';
import { apiFetch } from "../api_integration/api_fetch";
import {router} from "../main"
export async function changePasswordFormSubmit(ev:Event)
{
  ev.preventDefault()
  //  const nameInput = document.getElementById('settings-name') as HTMLInputElement;
  const user_password = (document.getElementById('user-password') as HTMLInputElement).value.trim()
  const new_password = (document.getElementById('new-password') as HTMLInputElement).value.trim()
  const new_password_confirm = (document.getElementById('new-password-confirm') as HTMLInputElement).value.trim()

  if (new_password != new_password_confirm){
    alert('new passwords not matched')
    return
  }
  const updatePasswordPayload:UpdatePasswordRequest = {
    oldPassword: user_password,
    newPassword: new_password,
    verifyNewPassword: new_password_confirm
  }
  try {
    const res:GeneralSuccessRes = await apiFetch<GeneralSuccessRes>("/api/user/update_password", {
      method: 'PATCH',
      body: JSON.stringify(updatePasswordPayload)
    })
    alert(res.message)
    history.pushState(null, '', '/settings');
    router('/settings')
  }
  catch (error:any)
  {
    if (!('StatusCode' in error))//not api related error 
        throw error
    else if (error.StatusCode == 401)
    {
      if (error.message == "Old password is incorrect.")
        alert("wrong password")
      else
        history.pushState(null, '', `/login?error=${encodeURIComponent("session expired please login again")}`);
    }
    else
        alert(error.message)
    }
  
}

export function renderSecurity(user: UserInfo): string {
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans">
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto relative p-8 -mt-6">
          
          <h1 class="text-6xl text-center font-bold mb-12 tracking-widest font-[solo]">
            Settings
          </h1>

          <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-2">
            <div class="lg:col-span-4 bg-[#2A3FA1] p-6 flex flex-col items-center relative h-full shadow-[-10px_-10px_0px_#441563]">
              <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-[#441563]">
                <img class="w-full h-full object-cover" src="../../public/imgs/person.svg" alt="profile picture">
              </div>
              <h2 class="text-2xl font-bold">${user.username}</h2>
              <p class="text-gray-300 text-sm mb-8">${user.name}</p>
              <div aria-label="Settings" class="w-full flex flex-col gap-3">
                <a  href="/settings" data-link class="bg-[#441563] font-bold hover:scale-105 duration-300 text-[#f2f2f2] flex items-center gap-3 px-6 py-3 cursor-pointer rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Personal information
                </a>    
                <a href="/security" data-link class="bg-[#f2f2f2] rounded-full font-bold px-6 py-3 flex items-center gap-3 text-[#441563] cursor-pointer hover:scale-105 duration-300 ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Security
                </a>
              </div>
            </div>

            <div class="col-span-8 bg-[#2A3FA1] h-full p-8 relative shadow-[-10px_-10px_0px_#441563] flex flex-col justify-between">
              
              <div>
                <h3 class="text-2xl font-bold mb-8">Security :</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                  
                  <form id="new-password-form" class="flex flex-col gap-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold ml-1">Current password:</label>
                        <input id="user-password" minLength=8 type="password" placeholder="your current password" required class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold ml-1">New password:</label>
                        <input id="new-password" minLength=8 type="password" placeholder="your new password" required class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold ml-1">Confirm new password:</label>
                        <input id="new-password-confirm" minLength=8 type="password" placeholder="confirm your new password" required class="w-full bg-[#441563] border border-transparent focus:border-purple-400 rounded-full px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all">
                    </div>
                        <div class="flex justify-end mt-12">
                          <button type="submit" class="bg-[#233596] shadow-[-5px_-5px_0px_#441563] cursor-pointer text-white font-semibold py-3 px-8 hover:scale-105 duration-300">
                            Save changes
                          </button>
                        </div>
                  </form>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold ml-1">Two factor authentication:</label>
                    <div class="mt-4">
                      <button class="bg-[#441563] text-gray-200 text-sm font-semibold px-8 py-3 rounded-full -mt-6 cursor-pointer  hover:scale-105  duration-300 ">
                        Enable
                      </button>
                    </div>
                  </div>

                </div>
              </div>


            </div>
          </div>
        </section>
      </div>
    </main>
  `;
}