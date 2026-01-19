// 2fa_after_login.ts
export function render_2fa(): string {
    return /* html */ `
      <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
        <div class="bg-[#2d2d44] rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-[#5F3779] rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-shield-alt text-white text-2xl"></i>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h1>
            <p class="text-gray-400 text-sm">
              Enter the 6-digit code from your authenticator app to continue
            </p>
          </div>
  
          <!-- Form -->
          <form id="2fa-verify-form" class="space-y-6">
            <!-- Code Input -->
            <div>
              <label for="2fa-code-input" class="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="2fa-code-input"
                name="code"
                maxlength="6"
                inputmode="numeric"
                pattern="[0-9]{6}"
                autocomplete="one-time-code"
                placeholder="000000"
                class="w-full bg-[#5F3779] text-white text-center text-2xl tracking-[0.5em] 
                       p-4 rounded-xl border-2 border-transparent
                       focus:border-[#2A3FA1] focus:outline-none
                       placeholder:text-gray-500 placeholder:tracking-[0.5em]"
                required
              />
            </div>
  
            <!-- Error Message Container -->
            <div id="2fa-error-message" class="hidden text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">
              <!-- Error message will be inserted here -->
            </div>
  
            <!-- Submit Button -->
            <button
              type="submit"
              id="2fa-verify-btn"
              class="w-full bg-[#2A3FA1] text-white text-lg font-semibold py-4 rounded-xl
                     hover:bg-[#3a4fb1] transition-all duration-300
                     hover:shadow-[0_6px_20px_rgba(42,63,161,0.6)]
                     active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </form>
  
          <!-- Back to Login Link -->
          <div class="mt-6 text-center">
            <a 
              href="/login" 
              data-link 
              class="text-[#2A3FA1] hover:text-[#3a4fb1] text-sm underline underline-offset-4 transition-colors"
            >
              ← Back to Login
            </a>
          </div>
  
          <!-- Help Text -->
          <p class="mt-6 text-center text-gray-500 text-xs">
            Open your authenticator app to view your verification code
          </p>
        </div>
      </main>
    `;
  }