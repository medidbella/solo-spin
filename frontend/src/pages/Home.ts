import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { renderUser } from "../components/user";
import { apiFetch } from "../api_integration/api_fetch";

export function renderHome(): string {
  return /* html */`
    <!-- Main Container -->
    <main class="h-screen flex flex-col">
      ${renderHeader()}
      
      <!-- Content Wrapper: Sidebar + Main Content -->
      <div class="flex flex-1 overflow-hidden">
        ${renderSideBar()}
        
        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col p-12 relative gap-4 h-full overflow-hidden">
          <!-- Search Bar -->
          <div class="relative w-full flex justify-center shrink-0">
            <div class="relative w-1/2">
              <input 
                type="text"
                id="search-input"
                autocomplete="off"
                placeholder="Search for a player by username..." 
                class="w-full px-4 py-3 pl-12 bg-[#1a1a2e] text-[#F2F2F2] rounded-lg border-2 border-[#441563] focus:outline-none focus:border-[#2A3FA1] placeholder-gray-400"
              />
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <!-- Error message container - hidden by default -->
              <p id="search-error" class="hidden text-red-500 text-sm m-1 absolute">User not found</p>
            </div>
          </div>
          
          <!-- Hero Section -->
          <div class="relative bg-[#2A3FA1] flex items-center justify-between flex-4 min-h-0 px-6 py-4 shadow-[-10px_-10px_0px_#441563]">
            <img class="h-full max-w-[25%] object-contain" src="./../../public/imgs/orange-boy.png" alt="Orange Team Player">
            <div class="flex flex-col items-center text-[#F2F2F2] z-10">
              <h1 class="font-[solo] text-7xl lg:text-9xl text-[#441563] opacity-80 mb-2">
                SoloSpin
              </h1>
              <div class="space-y-1 text-lg md:text-xl font-light tracking-wide text-center">
                <p>DISCOVER THE PINGPONG</p>
                <p>WORLD EXPERIENCE</p>
                <p>JOIN US FOR A MATCH!</p>
              </div>
            </div>
            <img class="h-full max-w-[25%] object-contain" src="./../../public/imgs/SignUpimg.png" alt="Blue Team Player">
          </div>
          
          <!-- Game Modes Section -->
          <div class="flex-3 min-h-0 w-full flex gap-6">
            <!-- Quick Match Card -->
            <div class="flex justify-around items-center bg-[#2A3FA1] w-full h-full shadow-[-10px_-10px_0px_#441563] p-4">
              <article class="flex flex-col items-center text-[#F2F2F2] gap-3">
                <h2 class="text-4xl lg:text-6xl text-center text-[#441563] font-[solo]">Ready to play?</h2>
                <div class="text-base lg:text-xl font-light text-center">
                  <p>Join a quick match to test your</p>
                  <p>skills against other players</p>
                </div>
                <button class="bg-black font-[solo] text-2xl lg:text-3xl text-[#441563] px-8 py-2 shadow-[5px_-5px_0px_#441563] cursor-pointer hover:scale-105 hover:text-[#f2f2f2] duration-300">PLAY</button>
              </article>
              <img class="h-full max-w-[45%] object-contain" src="../../public/imgs/table 1.png" alt="ping pong table">
            </div>
          </div>
        </main>
      </div>
      
      <!-- 
        MODAL CONTAINER - This is where the popup will appear
        - 'hidden' class hides it by default
        - 'fixed inset-0' makes it cover the entire screen
        - 'z-50' puts it on top of everything
        - 'bg-black/50' creates a semi-transparent dark overlay
      -->
      <div id="modal-container" class="hidden fixed inset-0 z-50 bg-black flex items-center justify-center">
        <!-- The user card will be injected here dynamically -->
      </div>
    </main>
  `;
}



/**
 * Sets up the search bar functionality
 * This function should be called after the Home page is rendered
 */
export function setupSearchLogic(): void {
    // Step 1: Get references to DOM elements we need
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const searchError = document.getElementById('search-error') as HTMLParagraphElement;
    const modalContainer = document.getElementById('modal-container') as HTMLDivElement;

    // Safety check - make sure elements exist before adding listeners
    if (!searchInput || !searchError || !modalContainer) {
        console.error('Search elements not found in DOM');
        return;
    }

    // Step 2: Listen for 'keydown' event on the search input
    // We use 'keydown' to detect when user presses Enter
    searchInput.addEventListener('keydown', async (event: KeyboardEvent) => {
        
        // Only proceed if the pressed key is 'Enter'
        if (event.key !== 'Enter') return;

        // Get the username from the input (trim removes whitespace)
        const username = searchInput.value.trim();
        console.log(username);
        // Don't search if input is empty
        if (username.length === 0) return;

        // Step 3: Clear any previous error state
        // Remove the red border and hide error message
        hideSearchError(searchInput, searchError);

        try {
            // Step 4: Call the API to search for the user
            // According to api_doc.md: GET /api/user/search?username=xxx
            // If user not found, it throws a 404 error
            await apiFetch(`/api/user/search?username=${encodeURIComponent(username)}`);

            // Step 5: If we reach here, user was found!
            // Show the user card popup
            showUserCard(modalContainer);

        } catch (error: any) {
            // Step 6: Handle errors
            // If status is 404, user doesn't exist - show red line
            if (error.statusCode === 404) {
                console.log(username);
                showSearchError(searchInput, searchError);
            } else {
                // For other errors (network, server, etc.), log them
                console.error('Search failed:', error);
            }
        }
    });

    // Step 7: Clear error when user starts typing again
    // This provides a better user experience
    searchInput.addEventListener('input', () => {
        hideSearchError(searchInput, searchError);
    });
}

/**
 * Shows the error state on the search bar
 * - Adds red border to input
 * - Shows "User not found" message
 */
function showSearchError(input: HTMLInputElement, errorElement: HTMLParagraphElement): void {
    // Add red border to the input
    input.classList.remove('border-[#441563]');
    input.classList.add('border-red-500');
    
    // Show the error message (remove 'hidden' class)
    errorElement.classList.remove('hidden');
}

/**
 * Hides the error state on the search bar
 * - Removes red border from input
 * - Hides "User not found" message
 */
function hideSearchError(input: HTMLInputElement, errorElement: HTMLParagraphElement): void {
    // Restore original border color
    input.classList.remove('border-red-500');
    input.classList.add('border-[#441563]');
    
    // Hide the error message (add 'hidden' class)
    errorElement.classList.add('hidden');
}

/**
 * Shows the user card popup
 * - Injects the user card HTML into the modal container
 * - Makes the modal visible
 * - Sets up the close button listener
 */
function showUserCard(modalContainer: HTMLDivElement): void {
    // Step 1: Inject the user card HTML into the modal
    modalContainer.innerHTML = renderUser();
    
    // Step 2: Show the modal (remove 'hidden' class)
    modalContainer.classList.remove('hidden');
    
    // Step 3: Set up the close button functionality
    setupCloseButton(modalContainer);
}

/**
 * Sets up the close button on the user card
 * When clicked, it hides the modal and clears its content
 */
function setupCloseButton(modalContainer: HTMLDivElement): void {
    const closeBtn = document.getElementById('closeCardBtn');
    
    if (!closeBtn) {
        console.error('Close button not found');
        return;
    }

    // When close button is clicked, hide the modal
    closeBtn.addEventListener('click', () => {
        closeModal(modalContainer);
    });

    // BONUS: Also close modal when clicking outside the card (on the dark overlay)
    modalContainer.addEventListener('click', (event: MouseEvent) => {
        // Only close if the click was directly on the overlay, not on the card
        // event.target is what was clicked, event.currentTarget is the modalContainer
        if (event.target === modalContainer) {
            closeModal(modalContainer);
        }
    });
}

/**
 * Closes the modal popup
 * - Hides the modal container
 * - Clears the modal content
 */
function closeModal(modalContainer: HTMLDivElement): void {
    // Hide the modal
    modalContainer.classList.add('hidden');
    
    // Clear the content (good practice to prevent memory leaks)
    modalContainer.innerHTML = '';
}