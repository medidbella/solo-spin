import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { apiFetch } from "../api_integration/api_fetch";
import type { LeaderboardResponse } from "../api_integration/api_types";

interface Player {
  rank: number;
  id: number;
  username: string;
  score: number;
}

export async function renderLeaderBoard(): Promise<string> {
  
  const leaderboardData = await apiFetch<LeaderboardResponse>("/api/leaderboard?limit=10");
  
  if (leaderboardData.length === 0) {
    return /* html */`
      <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
        ${renderHeader()}
        <div class="flex flex-1 overflow-hidden">
          ${renderSideBar()}
          <section class="flex-1 flex flex-col items-center justify-center p-4">
            <h1 class="text-2xl md:text-3xl font-bold mb-6">Leaderboard</h1>
            <p class="text-gray-400 text-base md:text-lg text-center">No players yet. Be the first to play!</p>
          </section>
        </div>
      </main>
    `;
  }

  const allPlayers: Player[] = leaderboardData.map((entry, index) => ({
    rank: index + 1,
    id: entry.id,
    username: entry.username,
    score: entry.total_xp_points
  }));

  const topThree = allPlayers.slice(0, 3);
  const restList = allPlayers.slice(3);

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
      
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden relative">
        
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto p-4 md:p-8 relative pb-24 lg:pb-10">
            
            <h1 class="text-center text-2xl md:text-3xl font-bold mb-6 md:mb-10 tracking-widest uppercase">Leaderboard</h1>
            
            <div class="flex justify-center items-end gap-3 md:gap-7 mb-10 md:mb-16 scale-90 md:scale-100">

                ${second ? `
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="/api/avatar/${second.id}" class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-indigo-500 object-cover shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-indigo-500 px-2 rounded-full text-[10px] md:text-xs">
                            2
                        </div>
                    </div>
                    <h3 class="mt-3 font-bold text-[10px] md:text-sm text-indigo-100 truncate max-w-[70px] md:max-w-none">${second.username}</h3>
                    <p class="text-indigo-400 text-[10px] md:text-xs">${second.score}</p>
                </div>
                ` : ''}

                ${first ? `
                <div class="flex flex-col items-center -mt-4 md:-mt-8"> 
                    <div class="text-2xl md:text-4xl mb-1 md:mb-2 animate-bounce">👑</div> 
                    <div class="relative">
                        <img src="/api/avatar/${first.id}" class="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-yellow-400 object-cover shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-yellow-400 text-yellow-400 px-2 md:px-3 rounded-full font-bold text-sm md:text-base">
                            1
                        </div>
                    </div>
                    <h3 class="mt-3 font-bold text-sm md:text-lg text-yellow-100 truncate max-w-[80px] md:max-w-none">${first.username}</h3>
                    <p class="text-yellow-400 font-bold text-xs md:text-base">${first.score}</p>
                </div>
                ` : ''}

                ${third ? `
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="/api/avatar/${third.id}" class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-orange-500 object-cover shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-orange-500 px-2 rounded-full text-[10px] md:text-xs">
                            3
                        </div>
                    </div>
                    <h3 class="mt-3 font-bold text-[10px] md:text-sm text-indigo-100 truncate max-w-[70px] md:max-w-none">${third.username}</h3>
                    <p class="text-orange-400 text-[10px] md:text-xs">${third.score}</p>
                </div>
                ` : ''}
            </div>

            <div class="flex flex-col gap-4 max-w-2xl mx-auto w-full">
                ${restList.map((player) => `
                    <div class="flex items-center group relative h-14 md:h-16">
                        <div class="absolute left-0 z-10 w-10 h-10 md:w-12 md:h-12 bg-indigo-900 border border-indigo-500 rotate-45 flex items-center justify-center shadow-[-3px_+3px_0px_#441563] md:shadow-[-5px_+5px_0px_#441563] group-hover:bg-indigo-600 transition-colors">
                            <span class="-rotate-45 font-bold text-white text-xs md:text-sm">
                                ${player.rank}
                            </span>
                        </div>
                        <div class="flex-1 ml-5 pl-10 md:pl-12 pr-4 md:pr-6 py-2 md:py-3 bg-indigo-900/30 border-r-4 border-indigo-600 flex justify-between items-center w-full h-full hover:bg-indigo-800/50 transition-all">
                            <div class="flex items-center gap-2 md:gap-4 overflow-hidden">
                                <img src="/api/avatar/${player.id}" class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 object-cover shrink-0">
                                <span class="font-semibold text-gray-200 text-sm md:text-base truncate">${player.username}</span>
                            </div>
                            <span class="font-bold text-indigo-300 tracking-wider text-xs md:text-sm shrink-0 ml-2">${player.score}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

        </section>
      </div>
    </main>
  `;
}