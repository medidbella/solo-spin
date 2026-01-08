
// import * as fs from 'fs'; // Import the file system module

import signUpContent from '../pages/signup.html?raw';

export function renderSignUpPage() {
    // const filePath: string = '../public/pages/signup.html';
    // let content: string | undefined;
    // try {
        // Read the file synchronously with 'utf-8' encoding
        // content = fs.readFileSync(filePath, 'utf-8');
        // console.log("File content:", content);
    // } catch (error) {
        // console.error("Error reading file:", error);
    // }
    // return content;

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
                console.log("Response Ok:", data);
                // TODO: Redirect user or show success message
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