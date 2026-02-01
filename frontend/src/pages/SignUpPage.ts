import { router } from "../main.ts"
import type { GeneralSuccessRes, RegisterRequest } from "../api_integration/api_types.ts";
import { apiFetch } from "../api_integration/api_fetch.ts";
import { showAlert } from "../utils/alert.ts";


export function renderSignUpPage() : string {
  return /* html */`
    <main class="h-screen flex items-center justify-center lg:justify-between bg-[#0e071e] overflow-hidden">
        <!-- the left side (image) -->
        <div class="hidden lg:flex w-1/2 h-screen items-center justify-center bg-opacity-10 relative">
            <img src="/imgs/piro-removebg-preview.png" 
                 alt="Character holding a racket" 
                 class="max-w-[100%] max-h-[100%] object-contain  ">
        </div>
        <!-- the right side (form and links and logo) -->
        
        <div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-4">
            <div class="flex justify-center mb-8">
              <img 
                  src="/imgs/logo.png" 
                  alt="solospin logo" 
                  /* Mobile: 32 (128px) | Desktop: 48 (192px) */
                  class="w-32 md:w-48 h-auto object-contain transition-all duration-300"
              >
            </div>
            
            <h2 class="text-white text-5xl lg:text-7xl font-[solo] mb-8 text-center">
                Register Now!
            </h2>
        <!-- the register form -->

            <form id="signupForm" class="w-full max-w-md flex flex-col gap-6">
                
                <div class="flex flex-col gap-1">
                    <label for="name" class="sr-only">Name</label>
                    <input type="text" 
                           id="name"
                           name="name" 
                           placeholder="Name" 
                           required
                           class="bg-[#5F3779] text-white placeholder-gray-300 w-full p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A3FA1] transition-all">
                </div>

                <div class="flex flex-col gap-1">
                    <label for="username" class="sr-only">Username</label>
                    <input type="text" 
                           id="username"
                           name="username" 
                           placeholder="Username" 
                           required
                           class="bg-[#5F3779] text-white placeholder-gray-300 w-full p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A3FA1] transition-all">
                </div>

                <div class="flex flex-col gap-1">
                    <label for="email" class="sr-only">Email</label>
                    <input type="email" 
                           id="email"
                           name="email" 
                           placeholder="Email" 
                           required
                           class="bg-[#5F3779] text-white placeholder-gray-300 w-full p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A3FA1] transition-all">
                </div>

                <div class="relative group">
                    <label for="password" class="sr-only">Password</label>
                    <input id="passwordInput" 
                           type="password" 
                           name="password" 
                           placeholder="Password" 
                           required
                           class="bg-[#5F3779] text-white placeholder-gray-300 w-full p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A3FA1] transition-all pr-12">
                    
                    <button type="button" id="togglePassword" class="absolute top-1/2 right-4 -translate-y-1/2 text-gray-300 hover:text-white cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
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
                    
                    <button type="button" id="toggleConfirmPassword" class="absolute top-1/2 right-4 -translate-y-1/2 text-gray-300 hover:text-white cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                    </button>
                </div>

                <button type="submit"
                        id=""
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


export function setupSignupLogic() {
  const form = document.getElementById('signupForm') as HTMLFormElement;
  const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (!form) return;

  const togglePasswordButton = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
  const toggleConfirmPasswordButton = document.getElementById('toggleConfirmPassword');
  const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;

  if (togglePasswordButton && passwordInput)
    {
      togglePasswordButton.addEventListener('click', () => {
        // Check if the current type is 'password'
        const isPassword = passwordInput.getAttribute('type') === 'password';
        const type = isPassword ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle the icon: Show 'eye-slash' if password is visible (text), otherwise show 'eye'
        togglePasswordButton.innerHTML = isPassword
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
               <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
               <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
               <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708"/>
             </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
               <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
               <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
             </svg>`;
      });
    }

  if (toggleConfirmPasswordButton && confirmPasswordInput) {
    toggleConfirmPasswordButton.addEventListener('click', () => {
      // Check if the current type is 'password'
      const isPassword = confirmPasswordInput.getAttribute('type') === 'password';
      const type = isPassword ? 'text' : 'password';
      confirmPasswordInput.setAttribute('type', type);

      // Toggle the icon for confirm password
      toggleConfirmPasswordButton.innerHTML = isPassword
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
             <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
             <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
             <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708"/>
           </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
             <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
             <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
           </svg>`;
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    
    // CHANGE HERE: Get 'name' directly (backend compatible)
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    // Check 1: Passwords match
    if (password !== confirmPassword) {
      showAlert("Passwords do not match!", "error"); 
      return;
    }

    // Check 2: Password length
    if (password.length < 8) {
      showAlert("Password must be at least 8 characters", "error");
      return;
    }

    const payload: RegisterRequest = {name, username, email, password};

    if (submitButton) submitButton.disabled = true;
    try {
      await apiFetch<GeneralSuccessRes>('/api/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      //the only case here is 200 Ok the errors from api or something else will catched and proccessed in the catch section
      showAlert("account created successfully", "success");
      history.pushState(null, '', '/home');
      router('/home');
    } catch (error: any) {
      // checking here the errors that comes from the api itself like username or email already taken 
      if ('statusCode' in error)
      {
        if (error.statusCode === 409) {
          showAlert(`Error: ${error.message || "Username or Email already taken"}`, "error");
        } else if (error.statusCode === 400) {
          showAlert(`Validation Error: ${error.message}`, "error");
        } else {
          showAlert(error.message || "Something went wrong", "error");
        }
      }
      else
      {
        console.error("Network error:", error);
        showAlert("Network issue, Try again", "error");
      }
    }
    finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}