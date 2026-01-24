
export function extractSecretFromOtpUrl(otpAuthUrl: string): string {
  try {
    const url = new URL(otpAuthUrl);
    
    const secret = url.searchParams.get('secret');
    
    return secret || 'Unable to extract code';
  } catch (error) {
    console.error('Failed to parse OTP URL:', error);
    return 'Unable to extract code';
  }
}

export function renderLoading(): string {
  return /* html */ `
    <div class="flex h-full items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  `;
}

export function renderTwoFactorSetup(manualCode: string, qrCodeSrc:string): string {
  return /* html */ `
    <div class="flex flex-col items-center justify-center h-full space-y-6 p-4">
      
      <h3 class="text-2xl font-bold text-center">
        Set up Two-Factor Authentication
      </h3>
      
      <p class="text-gray-300 text-center">
        Scan the following QR code:
      </p>
      
      <div class="bg-white p-4 rounded-lg">
        <img 
          id="qr-code-image" 
          src="${qrCodeSrc}" 
          alt="2FA QR Code" 
          class="w-40 h-40"
        />
      </div>
      
      <p class="text-gray-300 text-center">
        Or enter the code manually:
      </p>
      <code class="font-mono text-purple-300 select-all bg-[#441563] px-4 py-2 rounded-lg break-all max-w-xs text-center">
        ${manualCode}
      </code>
      
      <form id="two-factor-verify-form" class="w-full max-w-md space-y-4">
       
        <input 
          id="two-factor-code" 
          type="text" 
          placeholder="Enter 6-digit code..." 
          maxlength="6"
          minlength="6"
          pattern="[0-9]*"
          inputmode="numeric"
          autocomplete="one-time-code"
          required
          class="w-full bg-[#441563] border border-transparent focus:border-purple-400 
                 rounded-full px-6 py-4 text-center text-lg tracking-widest 
                 placeholder-gray-400 outline-none transition-all"
        />
        <p id="two-factor-error" class="text-red-400 text-center text-sm hidden"></p>
        <div class="flex justify-end">
          <button 
            type="submit" 
            id="verify-2fa-btn"
            class="bg-[#8B2D5B] text-white font-semibold py-3 px-8 
                   hover:scale-105 duration-300 cursor-pointer"
          >
            Verify
          </button>
        </div>
      </form>
      
    </div>
  `;
}

export function renderError(message: string): string {
  return /* html */ `
    <div class="flex flex-col h-full items-center justify-center space-y-4 p-4">
      
     
      <div class="text-red-400 text-5xl">
        <i class="fas fa-exclamation-circle"></i>
      </div>

      <p class="text-red-400 text-center">${message}</p>
      
  
      <button 
        id="retry-2fa-btn"
        class="bg-[#441563] text-white px-6 py-2 rounded-full 
               hover:scale-105 duration-300 cursor-pointer"
      >
        Try Again
      </button>
    </div>
  `;
}

export function renderSuccess(): string {
  return /* html */ `
    <div class="flex flex-col h-full items-center justify-center space-y-6 p-4">
      
      
      <div class="text-green-400 text-6xl">
        <i class="fas fa-check-circle"></i>
      </div>
      
      
      <h3 class="text-2xl font-bold text-center text-green-400">
        Two-Factor Authentication Enabled!
      </h3>
      
      
      <p class="text-gray-300 text-center">
        Your account is now more secure.
      </p>
      
      <a 
        href="/security" 
        data-link
        class="bg-[#441563] text-white px-6 py-3 rounded-full 
               hover:scale-105 duration-300"
      >
        Back to Security Settings
      </a>
    </div>
  `;
}