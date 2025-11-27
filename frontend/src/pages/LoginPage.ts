export function renderLoginPage() : string {
    return `<main class="flex justify-between min-h-screen">
        <!-- form and logo -->
        <div class="w-1/2 flex items-center flex-col">
            <div class="mb-0.5">
                <img src="../../public/imgs/logo.png" alt="Logo">
            </div>
            <h2 class="text-[#5F3779] text-8xl font-['SoloLeveling',serif]">Welcome back!</h2>
            <form action="" class="flex flex-col gap-4 mt-7 w-1/2">
                <input class="bg-[#5F3779] text-white p-3 w-full rounded-3xl" type="text" name="email" placeholder="user name">
                <div class="relative">
                    <input class="bg-[#5F3779] text-white p-3 w-full rounded-3xl" type="password" name="password" placeholder="password">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                </div>
            </form>
            <div class="flex justify-between w-1/2 mt-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" class="peer hidden" />

                  <!-- Custom checkbox -->
                  <span class="custom-checkbox"></span>

                  <span class="text-white">Remember me</span>
                </label>

                <a href="#" class="text-[#2A3FA1] text-xl underline decoration-[#2A3FA1] underline-offset-5">Forget password?</a>
            </div>
            <!-- login button -->
            <button class="bg-[#2A3FA1] text-white text-3xl mt-6 w-1/3 rounded-4xl p-3 cursor-pointer hover:scale-105 duration-300 shadow-[0_4px_12px_rgba(42,63,161,0.4)]
                            hover:shadow-[0_6px_20px_rgba(42,63,161,0.6)] hover:scale-[1.04]
                            active:scale-[0.97]
                            transition-all ease-out">Login</button>
            <!-- the Or section -->
            <div class="grid grid-cols-3 items-center mt-6 w-1/2">
                <hr class="border-[#2A3FA1]">
                <p class="text-[#2A3FA1] text-center text-2xl">OR</p>
                <hr class="border-[#2A3FA1]">
            </div>
            <!-- authentication login buttons -->
            <div class="flex flex-row gap-4 mt-3">
                <img src="../../public/imgs/Google.svg" alt="Google logo" class="cursor-pointer hover:scale-120 duration-500">
                <img src="../../public/imgs/GitHub.svg" alt="GitHub logo" class="cursor-pointer hover:scale-120 duration-500">
            </div>
            <div class="mt-7 flex flex-row items-center gap-2">
                <span class="text-white">First time in this world?</span>
                <a href="#" class="text-[#2A3FA1] text-xl underline decoration-[#2A3FA1] underline-offset-5">Enter the world!</a>
            </div>
        </div>
        <!-- image in the right side -->
         <div class="w-1/2 h-screen relative">
            <!-- Image -->
            <img src="../../public/imgs/loginPageimg.svg" alt="" class="w-full h-full object-cover">        
            <!-- Dark overlay -->
            <div class="absolute inset-0 bg-black/50"></div>

        </div>
    </main>`;
}