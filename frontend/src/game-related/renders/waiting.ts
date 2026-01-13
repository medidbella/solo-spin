import waitingContent from '../pages/waiting.html?raw';
import { withLayout } from './layout'; // Import your layout helper
import { navigateTo } from '../services/handle_pong_routes'; // Import your router helper
import { gameClient } from '../services/game_client';

// 1. Render Function
export function renderWaitingPage(): string {
    return withLayout(waitingContent);
}

// 2. Logic to attach events and customize message
export function setWaitingPageLogic() {
    
    const messageEl = document.getElementById('waitingMessage');
    const cancelBtn = document.getElementById('cancelWaitBtn');

    // 1. Customize Message based on Game Mode
    if (messageEl) {
        messageEl.textContent = "Initializing Game Arena...";
    }

    // 2. Define the Cancellation Logic
    let isCancelled = false; // Flag to stop navigation if user cancels
    let timerId: number;

    // 3. TIMEOUT LOGIC (10 Seconds)
    timerId = setTimeout(() => {
        // If we are still waiting after 10 seconds...
        if (!isCancelled) {
            console.log("⏰ Time is up!");
            if (messageEl) {
                messageEl.textContent = "⚠️ Server is taking too long.";
                messageEl.classList.add("text-red-400");
                messageEl.classList.remove("animate-pulse");
            }
            if (cancelBtn) {
                cancelBtn.textContent = "Return to Home";
                // Optionally change button color to gray or keep red
            }
        }
    }, 10000);

    // 3. Cancel Button Logic
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            isCancelled = true;
            clearTimeout(timerId); // Stop the timer immediately
            console.log("❌ User cancelled the operation");
            gameClient.reset(); // Clear data
            navigateTo('/home'); // Or back to setup
        });
    }

    // 4. The Async Fetch Function
    const performGameSetup = async () => {
        try {
            console.log("⏳ Sending request to server...");

            // A. Send the Request
            const response = await gameClient.sendSetUpRequest();

            // CRITICAL: Stop the 10s timer because we got a response!
            clearTimeout(timerId);

            // Check if user cancelled while we were waiting
            if (isCancelled) return;

            // B. Handle Success
            if (response.status === 'success') {
                console.log("✅ Game Created successfully! navigating to play...");
                
                // Navigate to the Game Canvas page
                navigateTo('/games/pong/play'); 
            } 
            // C. Handle Server Error (e.g., "System Busy")
            else {
                console.error(`❌ Server Error: ${response.error}`);
                alert(`Setup Failed: ${response.error}`); // Simple feedback
                navigateTo('/games/pong/setup'); // Go back to try again
            }

        } catch (error) {
            // Stop timer if network crashes
            clearTimeout(timerId);
            
            if (isCancelled) return;
            console.error("❌ Network Exception:", error);
            alert("Network error. Please check your connection.");
            navigateTo('/games/pong/setup');
        }
    };

    // 4. Trigger the fetch immediately
    performGameSetup();

}