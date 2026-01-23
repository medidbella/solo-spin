export function renderUser() : string{
    return /* html */
    `
<body class="bg-[#0F0317] min-h-screen flex items-center justify-center p-4">
    <button id="closeBtn" class="absolute top-5 left-5 z-10">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </button>
    
    <div class="bg-[#2A3FA1] w-full max-w-2xl h-96 shadow-xl flex flex-col items-center justify-center ">
        <div class="p-4 flex items-center">
            <img src="356306451_54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg" class="w-20 h-20 rounded-full mr-4">
            <div>
                <div class="text-white text-xl font-bold">username</div>
                <div class="text-white text-sm opacity-80">full name</div>
            </div>
        </div>
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

        <div class="text-white p-3 bg-[#475BC7] shadow-[-5px_-5px_0px_#441563] mb-4">
            add friend
        </div>
    </div>
        
    </body>`
}