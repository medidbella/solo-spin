import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";

// =========================================================================
// 1. TYPE DEFINITION (L'Plan)
// =========================================================================
// Hna kanwriw l TypeScript kifach "Player" dayr.
// Ila nssina chi 7aja (mitalan nssina score), TS ghadi y7bsna.
interface Player {
  rank: number;   // Tartib (1, 2, 3...)
  name: string;   // Smiya (username)
  score: number;  // Ni9at (XP)
  avatar: string; // Lien dyal tswira
}

// =========================================================================
// 2. MAIN FUNCTION
// =========================================================================
export function renderLeaderBoard(): string {
  
  // -- MOCK DATA (Données d'exemple) --
  // Hado homa li ghadi yjiw mn Backend mn b3d (JSON).
  // Daba kandirohom "Hardcoded" bach nzw9o l page.
  const allPlayers: Player[] = [
    { rank: 1, name: "Aakouhar", score: 6450, avatar: "/img/avatar1.png" },
    { rank: 2, name: "Two", score: 6009, avatar: "/img/avatar2.png" },
    { rank: 3, name: "Three", score: 5990, avatar: "/img/avatar3.png" },
    { rank: 4, name: "username1", score: 5675, avatar: "/img/avatar4.png" },
    { rank: 5, name: "username2", score: 5497, avatar: "/img/avatar5.png" },
    { rank: 6, name: "username3", score: 5097, avatar: "/img/avatar6.png" },
    { rank: 6, name: "username4", score: 5090, avatar: "/img/avatar7.png" },
    { rank: 6, name: "username5", score: 5070, avatar: "/img/avatar9.png" },
    { rank: 6, name: "username6", score: 5060, avatar: "/img/avatar8.png" },
  ];

  // -- LOGIC (T9sam dyal data) --
  // .slice(0, 3) -> Haz 3 lwala (0, 1, 2) bach n7ttohom f podium.
  const topThree = allPlayers.slice(0, 3);
  
  // .slice(3) -> Haz mn 3 tal lkher bach n7ttohom f list ta7t.
  const restList = allPlayers.slice(3);

  // Kankhdo 3 lwala b variable sahl bach nktbohom f HTML.
  const first = topThree[0];  // Mol Rank 1
  const second = topThree[1]; // Mol Rank 2
  const third = topThree[2];  // Mol Rank 3

  // -- HTML RETURN --
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
      
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto p-8 relative">
            
            <h1 class="text-center text-3xl font-bold mb-10 tracking-widest uppercase">Leaderboard</h1>

            <div class="flex justify-center items-end gap-6 mb-16">
                
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="${second.avatar}" class="w-20 h-20 rounded-full border-2 border-indigo-500 object-cover shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-indigo-500 px-2 rounded-full text-xs">
                            2
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-sm text-indigo-100">${second.name}</h3>
                    <p class="text-indigo-400 text-xs">${second.score}</p>
                </div>

                <div class="flex flex-col items-center -mt-8"> 
                    
                    <div class="text-4xl mb-2 animate-bounce">👑</div> 
                    
                    <div class="relative">
                        <img src="${first.avatar}" class="w-28 h-28 rounded-full border-4 border-yellow-400 object-cover shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                         
                         <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-yellow-400 text-yellow-400 px-3 rounded-full font-bold">
                            1
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-lg text-yellow-100">${first.name}</h3>
                    <p class="text-yellow-400 font-bold">${first.score}</p>
                </div>

                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="${third.avatar}" class="w-20 h-20 rounded-full border-2 border-orange-500 object-cover shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                        
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-orange-500 px-2 rounded-full text-xs">
                            3
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-sm text-indigo-100">${third.name}</h3>
                    <p class="text-orange-400 text-xs">${third.score}</p>
                </div>

            </div>

            <div class="flex flex-col gap-4 max-w-2xl mx-auto w-full pb-10">
                
                ${restList.map((player) => {
                    return `
                    <div class="flex items-center group relative h-16">
                        
                        <div class="absolute left-0 z-10 w-12 h-12 bg-indigo-900 border border-indigo-500 rotate-45 flex items-center justify-center shadow-[-5px_+5px_0px_#441563] group-hover:bg-indigo-600 transition-colors">
                            
                            <span class="-rotate-45 font-bold text-white text-sm">
                                0${player.rank}
                            </span>
                        </div>

                        <div class="flex-1 ml-6 pl-12 pr-6 py-3 bg-indigo-900/30 border-r-4 border-indigo-600 flex justify-between items-center w-full h-full hover:bg-indigo-800/50 transition-all">
                            
                            <div class="flex items-center gap-4">
                                <img src="${player.avatar}" class="w-10 h-10 rounded-full bg-slate-800 object-cover">
                                <span class="font-semibold text-gray-200">${player.name}</span>
                            </div>
                            
                            <span class="font-bold text-indigo-300 tracking-wider">${player.score}</span>
                        </div>

                    </div>
                    `;
                }).join('')} </div>

        </section>
      </div>
    </main>
  `;
}