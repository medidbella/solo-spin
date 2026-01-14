import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";


interface Achievement {
  code: string;
  title: string;
}

// this inerface describe how the backend response is
interface UserResponse {
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    level: number;
    games_lost: number;
    games_won: number;
    score: number; // this is the total Xp
  };
  levelProgress: number; // this is the direct porcentage without calculing it
  achievements: Achievement[];
}

interface MatchHistoryItem {
  loser_id: number;
  winner_id: number;
  score: string;
}


async function getProfileData(): Promise<UserResponse | null> {
  try {
    const response = await fetch('/api/me');
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null; // maybe i'll redirect to login page
  }
}

async function getMatchHistory(): Promise<MatchHistoryItem[]> {
  try {
    const response = await fetch('/api/games/history?limit=3'); // Limit 5 bhal li bghiti
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}



export async function renderProfile(): Promise<string> {
  
  // 1. Njibo Data
  const userData = await getProfileData();
  const matchHistory = await getMatchHistory();

  if (!userData) {
    return `<div class="text-white text-center mt-20">Error loading profile. Please login again.</div>`;
  }

  const { user, levelProgress, achievements } = userData;

  const totalGames = user.games_won + user.games_lost;
  const winRate = totalGames > 0 
    ? Math.round((user.games_won / totalGames) * 100) 
    : 0;
//render the circle based on the winrate
  const circleStyle = `background: conic-gradient(#8b5cf6 ${winRate}%, #1f2937 0);`;

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
                        <img src="/api/user/avatar?v=${Date.now()}" 
                             onerror="this.src='/imgs/default-avatar.png'" 
                             alt="User Avatar" 
                             class="w-full h-full rounded-full object-cover border-4 border-[#0b0c2a]">
                     </div>
                     <span class="absolute bottom-2 right-2 flex h-5 w-5">
                       <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span class="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-[#151638]"></span>
                     </span>
                  </div>

                  <div class="flex flex-col gap-2 w-full max-w-lg">
                     <h1 class="text-3xl font-bold uppercase tracking-widest">${user.username}</h1>
                     <p class="text-purple-400 text-lg font-medium">${user.name}</p>
                     
                     <div class="relative w-full h-6 bg-[#2a2c55] rounded-full mt-2">
                        <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                             style="width: ${levelProgress}%">
                        </div>
                     </div>
                     
                     <div class="flex justify-between text-xs text-gray-400 font-mono mt-1">
                        <span>Level ${user.level}</span>
                        <span>Score ${user.score} XP</span>
                     </div>
                  </div>
               </div>

               <div class="hidden md:block w-px h-32 bg-gray-700 mx-8"></div>
               
               <div class="flex flex-col items-center gap-4 z-10">
                  <h3 class="text-xl font-bold tracking-wide">Winning Rate</h3>
                  <div class="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
                       style="${circleStyle}">
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
                     ${
                       matchHistory.length > 0 
                       ? matchHistory.map(match => renderMatchItem(match, user.id)).join('')
                       : '<p class="text-gray-500">No matches played yet.</p>'
                     }
                  </div>
               </div>

               <div class="flex flex-col gap-4">
                  <h2 class="text-2xl font-bold font-mono mb-2">Achievements</h2>
                  
                  <div class="grid grid-cols-2 gap-4">
                     ${
                       achievements.length > 0
                       ? achievements.map(achievement => renderAchievementItem(achievement)).join('')
                       : `
                        <div class="col-span-2 flex-1 bg-[#151638]/50 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                           <p class="text-gray-400 text-lg">No achievements yet.</p>
                           <span class="text-xs text-gray-600 mt-2">Go play some games! 🏓</span>
                        </div>
                       `
                     }
                  </div>
               </div>
            </div>

         </main>
      </div>
    </main>
  `;
}




function renderMatchItem(match: MatchHistoryItem, currentUserId: number): string {
   // NOTE: Backend sent only the id to get the user name i must fetch again the user name by id or simple midbella sent the user also in api/me route
   
   const isWin = match.winner_id === currentUserId;
   const borderColor = isWin ? "border-purple-500" : "border-red-500"; // Red for lose
   const glow = isWin ? "shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "";
   
   

   return /* html */ `
     <div class="flex items-center justify-between bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 rounded-lg border-l-4 ${borderColor} ${glow} hover:scale-[1.02] transition-transform duration-300">
        <div class="flex items-center gap-3">
           <img src="/api/avatar/${match.winner_id}" class="w-10 h-10 rounded-full bg-gray-700 object-cover">
           <span class="font-bold text-sm">Player ${match.winner_id}</span>
        </div>
        
        <span class="font-mono text-xl font-black text-white bg-black/30 px-4 py-1 rounded-md tracking-widest">${match.score}</span>
        
        <div class="flex items-center gap-3">
           <span class="font-bold text-sm text-right">Player ${match.loser_id}</span>
           <img src="/api/avatar/${match.loser_id}" class="w-10 h-10 rounded-full bg-gray-700 object-cover">
        </div>
     </div>
   `;
}

function renderAchievementItem(achievement: Achievement): string {
    return /* html */ `
        <div class="bg-[#151638] p-4 rounded-xl border border-gray-700 flex items-center gap-3 hover:border-purple-500 transition-colors">
            <div class="text-2xl">🏆</div>
            <div>
                <h4 class="font-bold text-sm text-white">${achievement.title}</h4>
                <p class="text-xs text-gray-400">Code: ${achievement.code}</p>
            </div>
        </div>
    `;
}