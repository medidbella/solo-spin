export function renderSignUpPage() : string {
  // Note: Using absolute paths for images is safer for Vite builds
  return /* html */`
    <main class="min-h-screen flex items-center justify-center lg:justify-between bg-dark-background">
        
        <div class="hidden lg:flex w-1/2 h-screen items-center justify-center bg-opacity-10 relative">
            <img src="/imgs/SignUpimg.png" 
                 alt="Character holding a racket" 
                 class="max-w-[80%] max-h-[80%] object-contain animate-float drop-shadow-[0_0_30px_#2A3FA1]">
        </div>
        
        <div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-4">
            <div class="mb-4">
                <img src="/imgs/logo.png" alt="solospin logo" class="w-24 h-auto">
            </div>
            <h2 class="text-white text-8xl -mt-5 font-[solo]">
                Register Now!
            </h2>
            <div></div>
            <!-- the input form of registration -->
            <form class="mt-11 w-1/2 flex flex-col gap-4">
                <input type="text" placeholder="fullname" class="bg-[#5F3779] text-white w-full p-3 rounded-4xl">
                <input type="text" placeholder="username" class="bg-[#5F3779] text-white w-full p-3 rounded-4xl">
                <input type="text" placeholder="email" class="bg-[#5F3779] text-white w-full p-3 rounded-4xl">
                <div class="relative">
                    <input class="bg-[#5F3779] text-white p-3 w-full rounded-3xl" type="password" name="password" placeholder="password">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                    </button>
                </div>

                <div class="relative group">
                    <label for="confirm-password" class="sr-only">Confirm Password</label>
                    <input id="confirm-password" 
                           type="password" 
                           name="confirm_password" 
                           placeholder="Confirm Password" 
                           required
                           class="bg-[#5F3779] text-white placeholder-gray-300 w-full p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A3FA1] transition-all pr-12">
                </div>

                <button type="submit" 
                        class="bg-[#2A3FA1] text-white text-2xl font-bold mt-4 w-full rounded-full p-4 cursor-pointer
                               hover:scale-105 duration-300 shadow-[0_4px_12px_rgba(42,63,161,0.4)]
                               hover:shadow-[0_6px_20px_rgba(42,63,161,0.6)] active:scale-[0.97]
                               transition-all ease-out">
                  Create Account
                </button>
            </form>

            <div class="mt-8 flex flex-row gap-3 text-xl">
              <span class="text-white">Already a member?</span>
              <a href="/login" id="login-link" data-link
                 class="text-[#2A3FA1] font-bold underline underline-offset-4 hover:text-[#4b63d8]">Login</a>
            </div>
        </div>
    </main>
  `;   
}