// This function returns the HTML for the user card popup
// For now it's static, you can make it dynamic later by passing user data as parameters
export function renderUser(): string {
    return /* html */ `
    <!-- 
        User Card Container
        - This is the actual card content
        - It sits inside the modal-container overlay
        - 'relative' allows the close button to be positioned inside it
    -->
    <div class="bg-[#2A3FA1] w-full max-w-2xl shadow-xl flex flex-col items-center justify-center relative p-6">
        
        <!-- 
            Close Button
            - 'absolute top-4 right-4' positions it at top-right corner of the card
            - 'id="closeCardBtn"' is used to attach the click event listener
        -->
        <button id="closeCardBtn" class="absolute top-4 right-4 hover:scale-110 transition-transform">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <!-- User Info Section -->
        <div class="p-4 flex items-center">
            <img src="356306451_54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg" class="w-20 h-20 rounded-full mr-4">
            <div>
                <div class="text-white text-xl font-bold">username</div>
                <div class="text-white text-sm opacity-80">full name</div>
            </div>
        </div>
        
        <!-- Achievements Section -->
        <div class="p-4 text-white">
            last achievements
        </div>

        <div class="p-4 bg-[#475BC7] mb-5 shadow-[-5px_-5px_0px_#441563] flex gap-6">
            <div class="flex flex-col items-center">
                <img src="356306451_54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg"
                    class="w-20 h-20 rounded-full">
                <span class="mt-2 text-white text-sm">Achievement title</span>
            </div>

            <div class="flex flex-col items-center">
                <img src="356306451_54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg"
                    class="w-20 h-20 rounded-full">
                <span class="mt-2 text-white text-sm">Achievement title</span>
            </div>

            <div class="flex flex-col items-center">
                <img src="356306451_54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg"
                    class="w-20 h-20 rounded-full">
                <span class="mt-2 text-white text-sm">Achievement title</span>
            </div>
        </div>

        <!-- Add Friend Button -->
        <button id="addFriendBtn" class="text-white p-3 bg-[#475BC7] shadow-[-5px_-5px_0px_#441563] mb-4 hover:bg-[#5a6fd4] transition-colors cursor-pointer">
            add friend
        </button>
    </div>
    `;
}