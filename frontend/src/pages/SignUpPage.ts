export function renderSignUpPage() : string {
  return /* html */`
    <main class="min-h-screen flex items-center justify-center lg:justify-between bg-dark-background">
        <!-- the left side (image) -->
        <div class="hidden lg:flex w-1/2 h-screen items-center justify-center bg-opacity-10 relative">
            <img src="/imgs/SignUpimg.png" 
                 alt="Character holding a racket" 
                 class="max-w-[80%] max-h-[80%] object-contain animate-float drop-shadow-[0_0_30px_#2A3FA1]">
        </div>
        <!-- the right side (form and links and logo) -->
        
        <div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-4">
            <div class="mb-4">
                <img src="/imgs/logo.png" alt="solospin logo" class="w-24 h-auto">
            </div>
            
            <h2 class="text-white text-5xl lg:text-7xl font-[solo] mb-8 text-center">
                Register Now!
            </h2>
        <!-- the register form -->

            <form id="signupForm" class="w-full max-w-md flex flex-col gap-6">
                
                <div class="flex flex-col gap-1">
                    <label for="fullname" class="sr-only">Full Name</label>
                    <input type="text" 
                           id="fullname"
                           name="name" 
                           placeholder="Full Name" 
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
                    <input id="password" 
                           type="password" 
                           name="password" 
                           placeholder="Password" 
                           required
                           class="bg-[#5F3779] text-white placeholder-gray-300 w-full p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A3FA1] transition-all pr-12">
                    
                    <button type="button" id="togglePassword" class="absolute top-1/2 right-4 -translate-y-1/2 text-gray-300 hover:text-white">
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

interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export function setupSignupLogic() {
  const form = document.getElementById('signupForm') as HTMLFormElement;

  if (!form) return;

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
      alert("Passwords do not match!"); 
      return;
    }

    // Check 2: Password length
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    // CHANGE HERE: No more mapping needed (name: name)
    const payload: RegisterPayload = {
      name: name,
      username: username,
      email: email,
      password: password
    };

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 201) {
        alert("Account created successfully!");
        window.location.href = '/home'; 
      } 
      else if (response.status === 409) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Username or Email already taken"}`);
      } 
      else if (response.status === 400) {
        const errorData = await response.json();
        alert(`Validation Error: ${errorData.message}`);
      } 
      else {
        alert("Something went wrong. Please try again.");
      }

    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Check your connection.");
    }
  });
}