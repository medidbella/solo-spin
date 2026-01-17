

import { router } from '../../main';
import { gameClient } from '../services/game_client';

import signUpContent from '../pages/signup.html?raw';

const port = import.meta.env.VITE_NGINX_PORT;
const host = import.meta.env.VITE_HOST;

// const url = `http://${host}:${port}`;

export function renderSignUpPage() {
    return signUpContent;
}

export function setupSignupLogic() {
    const form = document.getElementById('signupForm') as HTMLFormElement;
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

    // Safety check
    if (!form || !errorMessage) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Clear previous errors before new attempt
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        const nameInput = document.getElementById('name') as HTMLInputElement; // Assuming id="name" based on your code
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        if (!nameInput || !passwordInput) return;

        const name = nameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('/api/user-management/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success! 
                console.log("Sign up Successful:", data);
                
                // 1. set player name
                gameClient.setPlayerName(nameInput.value);

                // 2. Connect the WebSocket (it stays alive now!)
                await gameClient.wsConnectionsHandler.connect();

                // 3. Update the URL
                window.history.pushState(null, '', '/home');

                // 4. Soft navigate to the home page
                router('/home');

            } else {
                // 2. Update error text from server response
                errorMessage.textContent = data.error || 'Signup failed';
                
                // 3. Reveal the error message
                errorMessage.classList.remove('hidden');
            }
        } catch (err) {
            // Network or parsing errors
            errorMessage.textContent = 'Network error. Please try again.';
            errorMessage.classList.remove('hidden');
        }
    });
}
