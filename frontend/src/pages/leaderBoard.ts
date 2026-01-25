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
          <section class="flex-1 flex flex-col items-center justify-center">
            <h1 class="text-3xl font-bold mb-6">Leaderboard</h1>
            <p class="text-gray-400 text-lg">No players yet. Be the first to play!</p>
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
      
      <div class="flex flex-1 overflow-hidden">
        
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto p-8 relative">
            
            <h1 class="text-center text-3xl font-bold mb-10 tracking-widest uppercase">Leaderboard</h1>
            
            <div class="flex justify-center items-end gap-7 mb-16">

                ${second ? `
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="/api/avatar/${second.id}" class="w-20 h-20 rounded-full border-2 border-indigo-500 object-cover shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-indigo-500 px-2 rounded-full text-xs">
                            2
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-sm text-indigo-100">${second.username}</h3>
                    <p class="text-indigo-400 text-xs">${second.score}</p>
                </div>
                ` : ''}

                ${first ? `
                <div class="flex flex-col items-center -mt-8"> 
                    <div class="text-4xl mb-2 animate-bounce">👑</div> 
                    <div class="relative">
                        <img src="/api/avatar/${first.id}" class="w-28 h-28 rounded-full border-4 border-yellow-400 object-cover shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-yellow-400 text-yellow-400 px-3 rounded-full font-bold">
                            1
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-lg text-yellow-100">${first.username}</h3>
                    <p class="text-yellow-400 font-bold">${first.score}</p>
                </div>
                ` : ''}

                ${third ? `
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="/api/avatar/${third.id}" class="w-20 h-20 rounded-full border-2 border-orange-500 object-cover shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-orange-500 px-2 rounded-full text-xs">
                            3
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-sm text-indigo-100">${third.username}</h3>
                    <p class="text-orange-400 text-xs">${third.score}</p>
                </div>
                ` : ''}
            </div>

            <div class="flex flex-col gap-4 max-w-2xl mx-auto w-full pb-10">
                ${restList.map((player) => `
                    <div class="flex items-center group relative h-16">
                        <div class="absolute left-0 z-10 w-12 h-12 bg-indigo-900 border border-indigo-500 rotate-45 flex items-center justify-center shadow-[-5px_+5px_0px_#441563] group-hover:bg-indigo-600 transition-colors">
                            <span class="-rotate-45 font-bold text-white text-sm">
                                ${player.rank}
                            </span>
                        </div>
                        <div class="flex-1 ml-6 pl-12 pr-6 py-3 bg-indigo-900/30 border-r-4 border-indigo-600 flex justify-between items-center w-full h-full hover:bg-indigo-800/50 transition-all">
                            <div class="flex items-center gap-4">
                                <img src="/api/avatar/${player.id}" class="w-10 h-10 rounded-full bg-slate-800 object-cover">
                                <span class="font-semibold text-gray-200">${player.username}</span>
                            </div>
                            <span class="font-bold text-indigo-300 tracking-wider">${player.score}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

        </section>
      </div>
    </main>
  `;
}