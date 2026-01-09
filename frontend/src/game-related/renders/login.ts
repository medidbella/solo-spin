
import loginContent from '../pages/login.html?raw';

import { gameSocket } from '../services/gameNetwork';

import { router } from '../../main';

function renderLoginPage() {

    return loginContent;
}

function setUpLoginLogic() {
    const form = document.getElementById('loginForm') as HTMLFormElement;
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

    if (!form || !errorMessage) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        const nameInput = document.getElementById('name') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        if (!nameInput || !passwordInput) return;

        try {
            // We assume the backend will have a route for login
            const response = await fetch('/api/user-management/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameInput.value,
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login Successful:", data);

                // // 1. Connect the WebSocket (it stays alive now!)
                // gameSocket.connect();

                // // 2. Update the URL
                // window.history.pushState(null, '', '/home');

                // // 3. Soft navigate to the home page
                router('/home');
            } else {
                errorMessage.textContent = data.error || 'Login failed';
                errorMessage.classList.remove('hidden');
            }
        } catch (err) {
            errorMessage.textContent = 'Network error. Please try again.';
            errorMessage.classList.remove('hidden');
        }
    });
}

export { renderLoginPage, setUpLoginLogic };