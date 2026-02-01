import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import {apiFetch} from "../api_integration/api_fetch"
import type {
  MeResponse, GamesHistoryResponse
} from "../api_integration/api_types"
import { showAlert } from "../utils/alert";

export async function renderProfile()
{
	try {
		const userData = await apiFetch<MeResponse>('/api/me');
		const matchHistory = await apiFetch<GamesHistoryResponse>('/api/user/games/history?limit=10');

		const totalGames = userData.user.games_won + userData.user.games_lost;
		const winRate = totalGames > 0 ? Math.round((userData.user.games_won / totalGames) * 100) : 0;
		const matchHistoryHtml = matchHistory.map(match => {
			const isWinner:boolean = match.winner.id === userData.user.id;
			const borderColor = isWinner ? 'border-purple-500' : 'border-red-500';
			const glowEffect = isWinner ? 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' : '';
			const opponentId:number = isWinner ? match.loser.id : match.winner.id;
      const opponentUsername = isWinner ? match.loser.username : match.winner.username
			const resultText = isWinner ? 'WIN' : 'LOSS';
			return `
			<div class="flex items-center justify-between bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-3 md:p-4 rounded-lg border-l-4 ${borderColor} ${glowEffect} hover:scale-[1.01] transition-transform duration-300">
				<div class="flex items-center gap-2 md:gap-3 shrink-0">
				<img src="/api/user/avatar" onerror="this.onerror=null; this.src='/imgs/default-avatar.png';" class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 object-cover">
				<span class="font-bold text-[10px] md:text-sm truncate max-w-[60px] md:max-w-none">${userData.user.username}</span>
				</div>
				<div class="flex flex-col items-center px-2">
				<span class="font-mono text-sm md:text-xl font-black text-white bg-black/30 px-2 md:px-4 py-1 rounded-md tracking-widest">${match.score}</span>
				<span class="text-[10px] ${isWinner ? 'text-green-400' : 'text-red-400'} font-bold">${resultText}</span>
				</div>
				<div class="flex items-center gap-2 md:gap-3 shrink-0">
				<span class="font-bold text-[10px] md:text-sm text-right truncate max-w-[60px] md:max-w-none">${opponentUsername}</span>
				<img src="/api/avatar/${opponentId}" onerror="this.onerror=null; this.src='/imgs/default-avatar.png';" class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 object-cover">
				</div>
			</div>
			`;
		}).join('');

		const matchHistorySection = matchHistory.length > 0 
			? matchHistoryHtml 
			: '<p class="text-gray-400 text-center py-8">No matches played yet</p>';

		const achievementsHtml = userData.achievements.map(achievement => {
			return `
			<div class="bg-[#151638] p-3 md:p-4 rounded-xl border border-gray-700 flex items-center gap-3 hover:border-purple-500 transition-colors">
			<img src="../../public/imgs/${achievement.code}.png" alt="${achievement.title}" class="w-10 h-10 md:w-15 md:h-15 object-contain">
			<div>
				<h4 class="font-bold text-[10px] md:text-sm text-white">${achievement.title}</h4>
				</div>
			</div>
			`;
		}).join('');

		const achievementsSection = userData.achievements.length > 0 
			? achievementsHtml 
			: '<p class="text-gray-400 text-center py-8 col-span-2">No achievements unlocked yet</p>';

		return /* html */ `
			<main class="h-screen flex flex-col bg-[#0b0c2a] text-white font-sans overflow-hidden">
			${renderHeader()}

			<div class="flex flex-1 overflow-hidden relative">
				${renderSideBar()}

				<main class="flex-1 flex flex-col p-4 md:p-8 lg:p-12 gap-6 md:gap-8 h-full overflow-y-auto pb-[100px] lg:pb-12">

					<div class="flex flex-col md:flex-row items-center justify-around w-full bg-[#151638] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 shadow-2xl relative overflow-hidden shrink-0">

						<div class="flex flex-col md:flex-row items-center gap-4 md:gap-10 z-10 w-full md:w-2/3">
							<div class="relative group shrink-0">
								<div class="w-20 h-20 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-blue-500">
									<img src="/api/user/avatar" 
										alt="User Avatar" 
										onerror="this.onerror=null; this.src='/imgs/default-avatar.png';"
										class="w-full h-full rounded-full object-cover border-4 border-[#0b0c2a]">
								</div>
								<span class="absolute bottom-1 right-1 md:bottom-2 md:right-2 flex h-4 w-4 md:h-5 md:w-5">
									<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
									<span class="relative inline-flex rounded-full h-4 w-4 md:h-5 md:w-5 bg-green-500 border-2 border-[#151638]"></span>
								</span>
							</div>

							<div class="flex flex-col gap-1 md:gap-2 w-full max-w-lg text-center md:text-left overflow-hidden">
								<h1 class="text-xl md:text-3xl font-bold uppercase tracking-widest truncate">${userData.user.username}</h1>
								<p class="text-purple-400 text-sm md:text-lg font-medium truncate">${userData.user.name}</p>

								<div class="relative w-full h-3 md:h-6 bg-[#2a2c55] rounded-full mt-1 md:mt-2">
									<div class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
										style="width: ${userData.levelProgress}%">
									</div>
								</div>

								<div class="flex justify-between text-[10px] md:text-xs text-gray-400 font-mono mt-1">
									<span>Level ${userData.user.level}</span>
									<span>Score ${userData.user.score} XP</span>
								</div>
						</div>
					</div>

					<div class="hidden md:block w-px h-32 bg-gray-700 mx-8"></div>

					<div class="flex flex-col items-center gap-2 md:gap-4 z-10 mt-4 md:mt-0">
						<h3 class="text-sm md:text-xl font-bold tracking-wide">Winning Rate</h3>
						<div class="relative w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl"
							style="background: conic-gradient(#8b5cf6 ${winRate}%, #1f2937 0);">
							<div class="w-16 h-16 md:w-24 md:h-24 bg-[#151638] rounded-full flex items-center justify-center">
								<span class="text-xl md:text-3xl font-bold text-white">${winRate}%</span>
							</div>
						</div>
					</div>

					<div class="absolute top-0 right-0 w-96 h-96 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full shrink-0">

						<div class="flex flex-col gap-4">
							<h2 class="text-xl md:text-2xl font-bold font-mono mb-2">Match History</h2>
							<div class="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-[300px] md:max-h-[400px]">
								${matchHistorySection}
							</div>
						</div>

						<div class="flex flex-col gap-4">
							<h2 class="text-xl md:text-2xl font-bold font-mono mb-2">Achievements</h2>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								${achievementsSection}
							</div>
						</div>
					</div>

				</main>
			</div>
			</main>
		`;
	}
	catch (error:any) {
		if ("statusCode" in error) {
			if (error.statusCode == 401){
				history.pushState(null, '', `/login?error=${encodeURIComponent("session expired please login again")}`);
			}
			else {
				history.pushState(null, '', `/home`);
				showAlert('unexpected server error please try again later', "error");
			}
		}
		else {
			history.pushState(null, '', `/home`);
			showAlert('connection error please try again later', "error")
		}
		return ""
	}
}