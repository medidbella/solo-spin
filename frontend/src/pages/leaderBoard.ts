import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";

interface Player {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}


export function renderLeaderBoard(): string {
  
const allPlayers: Player[] = [
    { rank: 1, name: "Aakouhar", score: 6450, avatar: "../../public/imgs/nigga.png" },
    { rank: 2, name: "Two", score: 6009, avatar: "../../public/imgs/sung.png" },
    { rank: 3, name: "Three", score: 5990, avatar: "../../public/imgs/orange-boy.png" },
    { rank: 4, name: "username1", score: 5675, avatar: "../../public/imgs/nigga.png" },
    { rank: 5, name: "username2", score: 5497, avatar: "../../public/imgs/nigga.png" },
    { rank: 6, name: "username3", score: 5097, avatar: "../../public/imgs/nigga.png" },
    { rank: 7, name: "username4", score: 5090, avatar: "../../public/imgs/nigga.png" },
    { rank: 8, name: "username5", score: 5070, avatar: "../../public/imgs/nigga.png" },
    { rank: 9, name: "username6", score: 5060, avatar: "../../public/imgs/nigga.png" },
  ];

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
            <!-- the first three wiiners div -->
            <div class="flex justify-center items-end gap-7 mb-16">
                <!-- second winner -->
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="${second.avatar}" class="w-20 h-20 rounded-full border-2 border-indigo-500 object-contain shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                        
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-indigo-500 px-2 rounded-full text-xs">
                            2
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-sm text-indigo-100">${second.name}</h3>
                    <p class="text-indigo-400 text-xs">${second.score}</p>
                </div>
                <!-- first winner the king -->
                <div class="flex flex-col items-center -mt-8"> 
                    
                    <div class="text-4xl mb-2 animate-bounce">👑</div> 
                    
                    <div class="relative">
                        <img src="${first.avatar}" class="w-28 h-28 rounded-full border-4 border-yellow-400 object-cover shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                         
                         <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-yellow-400 text-yellow-400 px-3 rounded-full font-bold">
                            1
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-lg text-yellow-100">${first.name}</h3>
                    <p class="text-yellow-400 font-bold">${first.score}</p>
                </div>
                <!-- third winner-->
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <img src="${third.avatar}" class="w-20 h-20 rounded-full border-2 border-orange-500 object-cover shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                        
                        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0e071e] border border-orange-500 px-2 rounded-full text-xs">
                            3
                        </div>
                    </div>
                    <h3 class="mt-4 font-bold text-sm text-indigo-100">${third.name}</h3>
                    <p class="text-orange-400 text-xs">${third.score}</p>
                </div>

            </div>
            <!-- other winners -->
            <div class="flex flex-col gap-4 max-w-2xl mx-auto w-full pb-10">
                
                ${restList.map((player) => {
                    return `
                    <div class="flex items-center group relative h-16">
                        
                        <div class="absolute left-0 z-10 w-12 h-12 bg-indigo-900 border border-indigo-500 rotate-45 flex items-center justify-center shadow-[-5px_+5px_0px_#441563] group-hover:bg-indigo-600 transition-colors">
                            
                            <span class="-rotate-45 font-bold text-white text-sm">
                                ${player.rank}
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