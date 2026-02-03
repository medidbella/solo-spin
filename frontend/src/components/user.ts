import type {UserProfileResponse, Achievement} from "../api_integration/api_types"

function renderAchievements(userAchievements: Achievement[])
{
    let result:string = ''
    if (userAchievements.length == 0)
        return `<p class="text-gray-400 text-center py-8 col-span-2">No achievements unlocked yet</p>`
    for (let i = 0; i < 3 && i < userAchievements.length; i++){
        result += /* html */ `
            <div class="flex flex-col items-center">
                <img src="../../public/imgs/${userAchievements[i].code}.png"
                    class="w-20 h-20 rounded-full">
                <span class="mt-2 text-white text-sm">${userAchievements[i].title}</span>
            </div>`
    }
    return result
}

export function renderUser(userProfile: UserProfileResponse): string {
    return /* html */ `
    <div class="bg-[#2A3FA1] w-full max-w-2xl shadow-xl flex flex-col items-center justify-center relative p-6">
        <button id="closeCardBtn" class="absolute top-4 right-4 hover:scale-110 transition-transform">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <!-- User Info Section -->
        <div class="p-4 flex items-center">
            <img src="/api/avatar/${userProfile.user.id}" class="w-20 h-20 rounded-full mr-4">
            <div>
                <div class="text-white text-xl font-bold">${userProfile.user.username}</div>
                <div class="text-white text-sm opacity-80">${userProfile.user.name}</div>
            </div>
        </div>
        
        <!-- Achievements Section -->
        <div class="p-4 text-white">
            last achievements
        </div>

        <div class="p-4 bg-[#475BC7] mb-5 shadow-[-5px_-5px_0px_#441563] flex gap-6">
            ${renderAchievements(userProfile.achievements)}
        </div>

        <p id="addFriend-error" class="hidden text-red-500 text-sm mt-2 mb-4">failed to add friend</p>
        
        <!-- Add Friend Button -->
        <button id="addFriendBtn" class="text-white p-3 bg-[#475BC7] shadow-[-5px_-5px_0px_#441563] hover:bg-[#5a6fd4] transition-colors cursor-pointer">
            add friend
        </button>
    </div>
    `;
}