export function render_2fa(): string {
  return /* html */ `
    <div id="login-left-side" class="w-1/2 flex flex-col items-center justify-center relative">
        <div class="mb-12">
            <img src="../../public/imgs/logo.png" alt="SoloSpin Logo" class="w-48">
        </div>
      <h2 class="text-[#f2f2f2] text-4xl md:text-5xl font-[solo] mb-4 text-center tracking-wide">
        Two-Factor Authentication
      </h2>
      <p class="text-gray-300 text-lg mb-10 text-center">
        Open your authenticator app and enter the 6-digit code
      </p>
      <form id="2fa-verify-form" class="flex flex-col gap-6 w-1/2 max-w-md">
          
          <input 
            type="text" 
            id="2fa-code-input"
            name="code"
            maxlength="6"
            inputmode="numeric" 
            pattern="[0-9]*"
            autocomplete="one-time-code"
            placeholder="Enter 6-digit code"
            class="bg-[#5F3779] text-white text-center text-xl placeholder-gray-400 
                   p-4 w-full rounded-3xl border-2 border-transparent 
                   focus:border-[#8B2D5B] focus:outline-none transition-all shadow-inner"
            required
          >
          <div id="2fa-error-message" class="hidden text-red-400 text-sm text-center font-bold bg-red-900/20 p-2 rounded-lg">
          </div>
          <button 
            type="submit"
            id="2fa-verify-btn"
            class="bg-[#2A3FA1] text-white text-2xl font-[solo] mt-4 w-full rounded-4xl p-3 cursor-pointer 
                   hover:scale-105 duration-300 shadow-[0_4px_12px_rgba(42,63,161,0.4)]
                   hover:shadow-[0_6px_20px_rgba(42,63,161,0.6)] 
                   active:scale-[0.97] transition-all ease-out
                   disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            verify
          </button>
      </form>
      <div class="mt-8">
          <a 
            href="/login" 
            data-link 
            class="text-[#2A3FA1] text-lg underline decoration-[#2A3FA1] underline-offset-4 hover:text-white transition-colors"
          >
            Back to Login
          </a>
      </div>
    </div>
  `;
}