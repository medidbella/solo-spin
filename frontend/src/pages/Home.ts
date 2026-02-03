import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { renderUser } from "../components/user";
import { apiFetch } from "../api_integration/api_fetch";
import { gameClient } from '../game-related/services/game_client';
import { router } from "../main";
import type {UserSearchResponse, UserProfileResponse} from "../api_integration/api_types"

export function renderHome(): string {
return /* html */`
		<main class="h-screen flex flex-col bg-[#0e071e] ">
			${renderHeader()}
			
			<div class="flex flex-1 overflow-hidden">
				${renderSideBar()}
				
				<main class="flex-1 flex flex-col p-4 md:p-12 relative gap-4 h-full overflow-y-auto lg:overflow-hidden">
					<div class="relative w-full flex justify-center shrink-0 mt-2 md:-mt-9">
					<div class="w-full md:w-1/2">
						<div class="relative ">
							<input 
								type="text"
								id="search-input"
								autocomplete="off"
								placeholder="Search player..." 
								class="w-full px-4 py-3 pl-12 bg-[#1a1a2e] text-[#F2F2F2] rounded-lg border-2 border-[#441563] focus:outline-none focus:border-[#2A3FA1] placeholder-gray-400 text-sm md:text-base"
							/>
							<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							</div>
							<p class="text-center text-sm text-red-500" id="input_error"></p>
							<p id="search-error" class="hidden text-red-500 text-sm m-1 absolute">User not found</p>
						</div>
					</div>
					
					<div class="relative bg-[#2A3FA1] flex items-center justify-around lg:justify-between flex-none lg:flex-4 min-h-[200px] px-4 md:px-6 py-4 shadow-[-6px_-6px_0px_#441563] md:shadow-[-10px_-10px_0px_#441563] overflow-visible">
    
						<img class="hidden lg:block h-[120%] w-auto object-contain drop-shadow-[0_0_40px_rgba(255,0,0,0.7)] scale-110 -translate-x-4 -translate-y-6 z-20" 
							src="./../../public/imgs/igris.png" 
							alt="Orange Team Player">

						<div class="flex flex-col items-center text-[#F2F2F2] z-10">
							<h1 class="font-[solo] text-5xl md:text-7xl lg:text-9xl text-[#441563] opacity-80 mb-2">
								SoloSpin
							</h1>
							<div class="space-y-1 text-sm md:text-lg lg:text-xl font-light tracking-wide text-center">
								<p>DISCOVER THE PINGPONG</p>
								<p>WORLD EXPERIENCE</p>
								<p>JOIN US FOR A MATCH!</p>
							</div>
						</div>

						<img class="hidden lg:block h-[130%] max-w-[30%] object-contain drop-shadow-[0_0_30px_rgba(200,23,200,1)] scale-100 translate-x-6 -translate-y-10 z-20" 
							src="./../../public/imgs/landingPage.png" 
							alt="Blue Team Player">
					</div>
					
					<div class="flex-none lg:flex-3 min-h-0 w-full flex gap-6 pb-20 lg:pb-0">
						<div class="flex flex-col md:flex-row justify-around items-center bg-[#2A3FA1] w-full h-full shadow-[-6px_-6px_0px_#441563] md:shadow-[-10px_-10px_0px_#441563] p-4 md:p-6 gap-4">
							<article class="flex flex-col items-center text-[#F2F2F2] gap-3">
								<h2 class="text-3xl md:text-4xl lg:text-6xl text-center text-[#441563] font-[solo]">Ready to play?</h2>
								<div class="text-sm md:text-base lg:text-xl font-light text-center">
									<p>Join a quick match to test your</p>
									<p>skills against other players</p>
								</div>
								<button
									id="btn-play-home"
									class="bg-black font-[solo] text-xl md:text-2xl lg:text-3xl text-[#441563] px-8 py-2 shadow-[5px_-5px_0px_#441563] cursor-pointer hover:scale-105 hover:text-[#f2f2f2] duration-300">
									PLAY
								</button>
							</article>
							<img class="h-32 md:h-full max-w-[80%] md:max-w-[45%] object-contain" src="../../public/imgs/table 1.png" alt="ping pong table">
						</div>
					</div>
				</main>
			</div>
			
			<div id="modal-container" class="hidden fixed inset-0 z-50 bg-black flex items-center justify-center">
			</div>
		</main>
	`;
}



export function setupSearchLogic(): void {
		const searchInput = document.getElementById('search-input') as HTMLInputElement;
		const searchError = document.getElementById('search-error') as HTMLParagraphElement;
		const modalContainer = document.getElementById('modal-container') as HTMLDivElement;
		const input_error = document.getElementById('input_error');
		const playBtn = document.getElementById('btn-play-home');

		if (!searchInput || !searchError || !modalContainer || !playBtn) {
				console.error('Search elements not found in DOM');
				return;
		}

		searchInput.addEventListener('keydown', async (event: KeyboardEvent) => {
				
				if (event.key !== 'Enter') return;

				const username = searchInput.value.trim();
				if (username.length === 0) return;

				hideSearchError(searchInput, searchError);

				searchInput.disabled = true;

        try {
            const user = await apiFetch<UserSearchResponse>(`/api/user/search?username=${encodeURIComponent(username)}`);
            const userProfileData = await apiFetch<UserProfileResponse>(`/api/user/${user.id}`)
            showUserCard(modalContainer, userProfileData);
        }
        catch (error: any) {
            if ("statusCode" in error)
            {
              if (error.statusCode === 404) {
                showSearchError(searchInput, searchError);
                if (input_error) input_error.innerText = "User not found";
              }
              else
              {
                showSearchError(searchInput, searchError);
                if (input_error) input_error.innerText = "Something went wrong, Please try again.";
              }
            }
             else {
                showSearchError(searchInput, searchError);
                if (input_error) input_error.innerText = "Connection error. Please check your network.";
            }
        }
        finally{
          searchInput.disabled = false;
        }
    });

		searchInput.addEventListener('input', () => {
				hideSearchError(searchInput, searchError);
				if (input_error) input_error.innerText = "";
		});

		playBtn.addEventListener('click', () => {
			gameClient.reset();
	
			history.pushState(null, '', '/games/pong/game-mode');
			router('/games/pong/game-mode');
		});
}


function showSearchError(input: HTMLInputElement, errorElement: HTMLParagraphElement): void {
		input.classList.remove('border-[#441563]');
		input.classList.add('border-red-500');
		
		errorElement.classList.remove('hidden');
}


function hideSearchError(input: HTMLInputElement, errorElement: HTMLParagraphElement): void {
		input.classList.remove('border-red-500');
		input.classList.add('border-[#441563]');
		
		errorElement.classList.add('hidden');
}

function showUserCard(modalContainer: HTMLDivElement, userProfileData:UserProfileResponse): void {
    modalContainer.innerHTML = renderUser(userProfileData);
    
    modalContainer.classList.remove('hidden');
    
    setupCloseButton(modalContainer);
    setupAddFriendButton(modalContainer, userProfileData.user.id)
}


function setupCloseButton(modalContainer: HTMLDivElement): void {
		const closeBtn = document.getElementById('closeCardBtn');
		
		if (!closeBtn) {
				console.error('Close button not found');
				return;
		}

		closeBtn.addEventListener('click', () => {
				closeModal(modalContainer);
		});

		modalContainer.addEventListener('click', (event: MouseEvent) => {
				if (event.target === modalContainer) {
						closeModal(modalContainer);
				}
		});
}

function setupAddFriendButton(modalContainer: HTMLDivElement, userId: number): void {
    const friendshipBtn = document.getElementById('addFriendBtn');
    const errorElement = document.getElementById('addFriend-error');
    
    if (!friendshipBtn) {
        console.error('Add friend button not found');
        return;
    }

    friendshipBtn.addEventListener('click', async () => {
        if (errorElement) errorElement.classList.add('hidden');
        try {
            await apiFetch('/api/friends/request', {
                method: 'POST',
                body: JSON.stringify({ receiver_id: userId })
            });
            closeModal(modalContainer);
        } catch (error: any) {
            if (errorElement) {
                errorElement.textContent = error.message || 'Failed to send friend request';
                errorElement.classList.remove('hidden');
            }
        }
    });
}

function closeModal(modalContainer: HTMLDivElement): void {
		modalContainer.classList.add('hidden');
		
		modalContainer.innerHTML = '';
}