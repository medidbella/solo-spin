import { apiFetch } from "../api_integration/api_fetch";
import { TwoFactorVerificationLogic } from "../components/TwoFactorSetup/TwoFactorLoginLogic";
import type {LoginRequest } from "../api_integration/api_types"
import { showAlert } from "../utils/alert";

export function renderLoginPage(): string {
return /* html */ `
  <main class="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-dark-background">
      <div id="login-left-content" class="w-full lg:w-1/2 flex items-center flex-col justify-center px-6 py-4 overflow-y-auto h-full">
          <div class="mb-2 shrink-0">
              <img src="../../public/imgs/logo.png" alt="Logo" class="w-32 md:w-40 lg:w-48">
          </div>
          
          <h2 class="text-[#f2f2f2] text-4xl md:text-6xl lg:text-7xl font-[solo] text-center leading-tight shrink-0">Welcome back!</h2>
          
          <form id="login-form" class="flex flex-col gap-3 lg:gap-4 mt-4 lg:mt-6 w-full max-w-md lg:max-w-sm">
              <input 
                class="bg-[#5F3779] text-white p-3 w-full rounded-3xl outline-none focus:ring-2 focus:ring-[#2A3FA1] text-sm md:text-base" 
                type="text" 
                name="username" 
                placeholder="Username"
                minlength="4"
                required>
              
              <div class="relative">
                  <input 
                    id="login-password"
                    class="bg-[#5F3779] text-white p-3 w-full rounded-3xl outline-none focus:ring-2 focus:ring-[#2A3FA1] text-sm md:text-base" 
                    type="password" 
                    name="password" 
                    placeholder="Password"
                    minlength="8"
                    required>
                  <button type="button" id="toggle-password" class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                      </svg>
                  </button>
              </div>
              <button 
                id="loginButton"
                type="submit"
                class="bg-[#2A3FA1] text-white text-xl lg:text-2xl mt-4 w-full rounded-4xl p-2.5 lg:p-3 cursor-pointer 
                       hover:scale-105 duration-300 shadow-[0_4px_12px_rgba(42,63,161,0.4)]
                       active:scale-[0.97] transition-all ease-out">
                Login
              </button>
          </form>
          
          <div class="grid grid-cols-3 items-center mt-5 w-full max-w-md lg:max-w-sm shrink-0">
              <hr class="border-[#2A3FA1]">
              <p class="text-[#2A3FA1] text-center text-lg lg:text-xl">OR</p>
              <hr class="border-[#2A3FA1]">
          </div>
          
          <div class="flex flex-row gap-4 mt-3 shrink-0">
              <img src="../../public/imgs/Google.svg" alt="Google" class="w-8 md:w-10 cursor-pointer hover:scale-110 duration-300" id="google-login">
              <img src="../../public/imgs/GitHub.svg" alt="GitHub" class="w-8 md:w-10 cursor-pointer hover:scale-110 duration-300" id="github-login">
          </div>
          
          <div class="mt-6 flex flex-col sm:flex-row items-center gap-2 text-center shrink-0">
              <span class="text-white text-sm md:text-base">First time in this world?</span>
              <a href="/signup" data-link class="text-[#2A3FA1] text-base md:text-lg underline decoration-[#2A3FA1] underline-offset-4 font-bold">
                Enter the world!
              </a>
          </div>
      </div>
      
      <div class="hidden lg:block lg:w-1/2 h-full relative">
          <img 
            src="../../public/imgs/loginPageimg.svg" 
            alt="Login illustration" 
            class="w-full h-full object-cover animate-float">        
          <div class="absolute inset-0 bg-black/50"></div>
      </div>
  </main>
`;
}


function check2FaLoginQuery(): boolean
{
  const urlParams = new URLSearchParams(window.location.search);
  const mfaParam = urlParams.get('requires2FA');
  if (mfaParam === 'true')
  {
    console.log("2FA Mode Detected from OAuth redirect");
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    return true
  }
  return false
}

function checkAndDisplayErrorQuery()
{
  const urlParams = new URLSearchParams(window.location.search);  
  const errorParam = urlParams.get('error')

  if (errorParam){
    showAlert(errorParam, "error");
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
}

export function setUpLoginLogic() {
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const LoginButton = document.getElementById('loginButton') as HTMLButtonElement;

    const googleButton = document.getElementById('google-login');
    const githubButton = document.getElementById('github-login');

    if (googleButton)
    {
      googleButton.addEventListener('click', () => {
        window.location.href = '/api/login/google';
      });
    }

    if (githubButton)
    {
      githubButton.addEventListener('click', () => {
        window.location.href = '/api/login/github';
      })
    }
    if (!loginForm) return;

    //handel toggle password logic

    const togglePasswordButton = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password') as HTMLInputElement;

    if (togglePasswordButton && passwordInput)
    {
        togglePasswordButton.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            const type = isPassword ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            togglePasswordButton.innerHTML = isPassword
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
                     <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
                     <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                     <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708"/>
                   </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                     <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                     <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                   </svg>`;
        });
    }
    checkAndDisplayErrorQuery()
    if (check2FaLoginQuery())
      TwoFactorVerificationLogic()
    loginForm.addEventListener('submit', async (event) =>{
        event.preventDefault(); //to make sure the page not reloaded

        LoginButton.disabled = true; // this to send request one time not a lot of times even if the user press a lot

        const formData = new FormData(loginForm); // this create an object that holds my inputs and gives me a lot of options in js

        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const payLoad : LoginRequest = { username , password };

        try {
            const response = await apiFetch<any>('/api/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                  body: JSON.stringify(payLoad),
                });
                if ("requires2FA" in response){
                  return TwoFactorVerificationLogic()
                }
                else
                {
                  console.log(response.message);
                  window.location.href = '/home';
                }
        }
        catch(Error : any) {
            if ("statusCode" in Error)
            {
              if (Error.statusCode == 401)
              {
                showAlert("Invalid username or password", "error");
                    LoginButton.disabled = false;
                    return ;
              }
              else
              {
                 showAlert("Something went wrong. Please try again later.", "error");
                 LoginButton.disabled = false;
              }
            }
            showAlert("Connection error, try again", "error");
            console.error("Login Error: ", Error);
        }
        finally{
            LoginButton.disabled = false;
        }
    })

}