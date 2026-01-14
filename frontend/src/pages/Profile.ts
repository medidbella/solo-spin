import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";


// ============================================================
// STEP 1: Define the data types we expect from the API
// ============================================================

// This matches what /api/me returns
interface UserData {
  user: {
    id: number;
    name: string;
    username: string;
    level: number;
    games_lost: number;
    games_won: number;
    score: number;
  };
  levelProgress: number;
  achievements: Array<{ code: string; title: string }>;
}

// This matches what /api/games/history returns
interface GameHistory {
  winner_id: number;
  loser_id: number;
  score: string;
}


// ============================================================
// STEP 2: Make the function async so we can use fetch + await
// ============================================================

export async function renderProfile(): Promise<string> {

  // ----------------------------------------------------------
  // STEP 3: Fetch user data from /api/me
  // ----------------------------------------------------------
  // credentials: 'include' is REQUIRED to send the httpOnly cookies
  // Without it, the server won't receive the access token!
  
  const userResponse = await fetch('/api/me', {
    method: 'GET',
    credentials: 'include'
  });

  // If unauthorized (401), redirect to login page
  if (userResponse.status === 401) {
    window.location.href = '/login';
    return ''; // Return empty string, page will redirect
  }

  // If any other error, throw to trigger error handling in main.ts
  if (!userResponse.ok) {
    throw new Error('Failed to fetch user data');
  }

  // Parse the JSON response
  const userData: UserData = await userResponse.json();


  // ----------------------------------------------------------
  // STEP 4: Fetch match history from /api/games/history
  // ----------------------------------------------------------
  
  const historyResponse = await fetch('/api/games/history?limit=10', {
    method: 'GET',
    credentials: 'include'
  });

  // Default to empty array if fetch fails (don't break the whole page)
  let matchHistory: GameHistory[] = [];
  if (historyResponse.ok) {
    matchHistory = await historyResponse.json();
  }


  // ----------------------------------------------------------
  // STEP 5: Calculate the winning rate percentage
  // ----------------------------------------------------------
  
  const totalGames = userData.user.games_won + userData.user.games_lost;
  
  // Avoid division by zero if user has no games
  const winRate = totalGames > 0 
    ? Math.round((userData.user.games_won / totalGames) * 100) 
    : 0;


  // ----------------------------------------------------------
  // STEP 6: Build the match history HTML dynamically
  // ----------------------------------------------------------
  
  // We loop through each match and create HTML for it
  const matchHistoryHtml = matchHistory.map(match => {
    // Check if current user won this match
    const isWinner = match.winner_id === userData.user.id;
    
    // Choose border color: purple for win, red for loss
    const borderColor = isWinner ? 'border-purple-500' : 'border-red-500';
    
    // Add glow effect only for wins
    const glowEffect = isWinner ? 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' : '';
    
    // Get opponent ID (the other player)
    const opponentId = isWinner ? match.loser_id : match.winner_id;
    
    // Result text to show
    const resultText = isWinner ? 'WIN' : 'LOSS';

    return `
      <div class="flex items-center justify-between bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 rounded-lg border-l-4 ${borderColor} ${glowEffect} hover:scale-[1.02] transition-transform duration-300">
        <div class="flex items-center gap-3">
          <img src="/api/user/avatar" onerror="this.onerror=null; this.src='/imgs/default-avatar.png';" class="w-10 h-10 rounded-full bg-gray-700 object-cover">
          <span class="font-bold text-sm">${userData.user.username}</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="font-mono text-xl font-black text-white bg-black/30 px-4 py-1 rounded-md tracking-widest">${match.score}</span>
          <span class="text-xs ${isWinner ? 'text-green-400' : 'text-red-400'} font-bold">${resultText}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold text-sm text-right">Player #${opponentId}</span>
          <img src="/api/avatar/${opponentId}" onerror="this.onerror=null; this.src='/imgs/default-avatar.png';" class="w-10 h-10 rounded-full bg-gray-700 object-cover">
        </div>
      </div>
    `;
  }).join(''); // Join all match HTML strings together

  // Show message if no matches yet
  const matchHistorySection = matchHistory.length > 0 
    ? matchHistoryHtml 
    : '<p class="text-gray-400 text-center py-8">No matches played yet</p>';


  // ----------------------------------------------------------
  // STEP 7: Build the achievements HTML dynamically
  // ----------------------------------------------------------
  
  const achievementsHtml = userData.achievements.map(achievement => {
    return `
      <div class="bg-[#151638] p-4 rounded-xl border border-gray-700 flex items-center gap-3 hover:border-purple-500 transition-colors">
        <div class="text-2xl">🏆</div>
        <div>
          <h4 class="font-bold text-sm text-white">${achievement.title}</h4>
          <p class="text-xs text-gray-400">Code: ${achievement.code}</p>
        </div>
      </div>
    `;
  }).join('');

  // Show message if no achievements yet
  const achievementsSection = userData.achievements.length > 0 
    ? achievementsHtml 
    : '<p class="text-gray-400 text-center py-8 col-span-2">No achievements unlocked yet</p>';


  // ----------------------------------------------------------
  // STEP 8: Return the final HTML with all dynamic data
  // ----------------------------------------------------------

  return /* html */ `
    <main class="h-screen flex flex-col bg-[#0b0c2a] text-white font-sans overflow-hidden">
      ${renderHeader()}

      <div class="flex flex-1 overflow-hidden">
         ${renderSideBar()}

         <main class="flex-1 flex flex-col p-8 lg:p-12 gap-8 h-full overflow-y-auto">
            
            <div class="flex flex-col md:flex-row items-center justify-around w-full bg-[#151638] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
               
               <div class="flex items-center gap-10 z-10 w-full md:w-2/3">
                  <div class="relative group">
                     <div class="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-blue-500">
                        <!-- Avatar: Use /api/user/avatar endpoint, fallback to default if 404 -->
                        <img src="/api/user/avatar" 
                             alt="User Avatar" 
                             onerror="this.onerror=null; this.src='/imgs/default-avatar.png';"
                             class="w-full h-full rounded-full object-cover border-4 border-[#0b0c2a]">
                     </div>
                     <span class="absolute bottom-2 right-2 flex h-5 w-5">
                       <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span class="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-[#151638]"></span>
                     </span>
                  </div>

                  <div class="flex flex-col gap-2 w-full max-w-lg">
                     <!-- Username from API -->
                     <h1 class="text-3xl font-bold uppercase tracking-widest">${userData.user.username}</h1>
                     <!-- Full name from API -->
                     <p class="text-purple-400 text-lg font-medium">${userData.user.name}</p>
                     
                     <!-- Level progress bar - width comes from API -->
                     <div class="relative w-full h-6 bg-[#2a2c55] rounded-full mt-2">
                        <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                             style="width: ${userData.levelProgress}%">
                        </div>
                     </div>
                     
                     <!-- Level and Score from API -->
                     <div class="flex justify-between text-xs text-gray-400 font-mono mt-1">
                        <span>Level ${userData.user.level}</span>
                        <span>Score ${userData.user.score} XP</span>
                     </div>
                  </div>
               </div>

               <div class="hidden md:block w-px h-32 bg-gray-700 mx-8"></div>
               
               <!-- Winning rate - calculated from games_won / total games -->
               <div class="flex flex-col items-center gap-4 z-10">
                  <h3 class="text-xl font-bold tracking-wide">Winning Rate</h3>
                  <div class="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
                       style="background: conic-gradient(#8b5cf6 ${winRate}%, #1f2937 0);">
                     <div class="w-24 h-24 bg-[#151638] rounded-full flex items-center justify-center">
                        <span class="text-3xl font-bold text-white">${winRate}%</span>
                     </div>
                  </div>
               </div>
               
               <div class="absolute top-0 right-0 w-96 h-96 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full h-full min-h-0">
               
               <div class="flex flex-col gap-4">
                  <h2 class="text-2xl font-bold font-mono mb-2">Match History</h2>
                  
                  <div class="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                     <!-- Match history loaded from API -->
                     ${matchHistorySection}
                  </div>
               </div>

               <div class="flex flex-col gap-4">
                  <h2 class="text-2xl font-bold font-mono mb-2">Achievements</h2>
                  
                  <div class="grid grid-cols-2 gap-4">
                     <!-- Achievements loaded from API -->
                     ${achievementsSection}
                  </div>
               </div>
            </div>

         </main>
      </div>
    </main>
  `;
}