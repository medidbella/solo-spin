import { apiFetch } from "../api_integration/api_fetch";
import type {LoginRequest, GeneralSuccessRes } from "../api_integration/api_types"
import { router } from "../main";

export function renderLoginPage(): string {
  return /* html */ `
    <main class="flex justify-between min-h-screen">
        <div class="w-1/2 flex items-center flex-col">
            <!-- Logo -->
            <div class="mb-0.5">
                <img src="../../public/imgs/logo.png" alt="Logo">
            </div>
            
            <h2 class="text-[#f2f2f2] text-8xl font-[solo]">Welcome back!</h2>
            
            <!-- LOGIN FORM -->
            <form id="login-form" class="flex flex-col gap-4 mt-7 w-1/2">
                <!-- Username Input -->
                <input 
                  class="bg-[#5F3779] text-white p-3 w-full rounded-3xl" 
                  type="text" 
                  name="username" 
                  placeholder="Username"
                  minlength="4"
                  required>
                
                <!-- Password Input -->
                <div class="relative">
                    <input 
                      id="login-password"
                      class="bg-[#5F3779] text-white p-3 w-full rounded-3xl" 
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
                
                <!-- Remember Me & Forget Password -->
                <div class="flex justify-between w-full mt-2">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" id="remember-me" class="peer hidden" />
                      <span class="custom-checkbox"></span>
                      <span class="text-white">Remember me</span>
                    </label>
                    <a href="#" class="text-[#2A3FA1] text-xl underline decoration-[#2A3FA1] underline-offset-5">
                      Forget password?
                    </a>
                </div>
                
                <!-- LOGIN BUTTON INSIDE FORM! -->
                <button 
                  id="loginButton"
                  type="submit"
                  class="bg-[#2A3FA1] text-white text-3xl mt-6 w-full rounded-4xl p-3 cursor-pointer 
                         hover:scale-105 duration-300 shadow-[0_4px_12px_rgba(42,63,161,0.4)]
                         hover:shadow-[0_6px_20px_rgba(42,63,161,0.6)] hover:scale-[1.04]
                         active:scale-[0.97] transition-all ease-out
                         disabled:opacity-50 disabled:cursor-not-allowed">
                  Login
                </button>
            </form>
            
            <!-- OR Divider -->
            <div class="grid grid-cols-3 items-center mt-6 w-1/2">
                <hr class="border-[#2A3FA1]">
                <p class="text-[#2A3FA1] text-center text-2xl">OR</p>
                <hr class="border-[#2A3FA1]">
            </div>
            
            <!-- OAuth Login Buttons -->
            <div class="flex flex-row gap-4 mt-3">
                <img 
                  src="../../public/imgs/Google.svg" 
                  alt="Google logo" 
                  class="cursor-pointer hover:scale-120 duration-500"
                  id="google-login">
                <img 
                  src="../../public/imgs/GitHub.svg" 
                  alt="GitHub logo" 
                  class="cursor-pointer hover:scale-120 duration-500"
                  id="github-login">
            </div>
            
            <!-- Sign Up Link -->
            <div class="mt-7 flex flex-row items-center gap-2">
                <span class="text-white">First time in this world?</span>
                <a href="/signup" data-link class="text-[#2A3FA1] text-xl underline decoration-[#2A3FA1] underline-offset-5">
                  Enter the world!
                </a>
            </div>
        </div>
        
        <!-- Right Side Image -->
        <div class="w-1/2 h-screen relative">
            <img 
              src="../../public/imgs/loginPageimg.svg" 
              alt="Login illustration" 
              class="w-full h-full object-cover animate-float">        
            <div class="absolute inset-0 bg-black/50"></div>
        </div>
    </main>
  `;
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
                // if ("2fa_temp" in response)
                // {
                //   console.log("to do it");
                // }
                // else
                // {
                  console.log("logged successfully");
                  console.log(response.message);
                  window.location.href = '/home';
                // }
        }
        catch(Error : any) {
            if ("statusCode" in Error)
            {
              if (Error.statusCode == 401)
              {
                alert("Invalid username or password");
                    LoginButton.disabled = false;
                    return ;
              }
              else
              {
                 alert("Something went wrong. Please try again later.");
                 LoginButton.disabled = false;
              }
            }
            alert("Connection error, try again");
            console.error("Login Error: ", Error);
        }
        finally{
            LoginButton.disabled = false;
        }
    }

    )
    

}