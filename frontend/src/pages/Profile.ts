import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import {apiFetch} from "../api_integration/api_fetch"
import type {
  MeResponse, GamesHistoryResponse
} from "../api_integration/api_types"



export async function renderProfile()
{
	try {
		const userData = await apiFetch<MeResponse>('/api/me');
		const matchHistory = await apiFetch<GamesHistoryResponse>('/api/user/games/history?limit=10');

    console.log(matchHistory)

		const totalGames = userData.user.games_won + userData.user.games_lost;
		const winRate = totalGames > 0 ? Math.round((userData.user.games_won / totalGames) * 100) : 0;
		const matchHistoryHtml = matchHistory.map(match => {
			const isWinner:boolean = match.winner.id === userData.user.id;
			const borderColor = isWinner ? 'border-purple-500' : 'border-red-500';
			const glowEffect = isWinner ? 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' : '';
			const opponentId:number = isWinner ? match.loser.id : match.winner.id;
      const opponentUsername = isWinner ? match.loser.username : match.winner.username
			const resultText = isWinner ? 'WIN' : 'LOSS';
      console.log(isWinner, opponentId)
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
				<span class="font-bold text-sm text-right">${opponentUsername}</span>
				<img src="/api/avatar/${opponentId}" onerror="this.onerror=null; this.src='/imgs/default-avatar.png';" class="w-10 h-10 rounded-full bg-gray-700 object-cover">
				</div>
			</div>
			`;
		}).join(''); // Join all match HTML strings together

		const matchHistorySection = matchHistory.length > 0 
			? matchHistoryHtml 
			: '<p class="text-gray-400 text-center py-8">No matches played yet</p>';


		const achievementsHtml = userData.achievements.map(achievement => {
			return `
			<div class="bg-[#151638] p-4 rounded-xl border border-gray-700 flex items-center gap-3 hover:border-purple-500 transition-colors">
			<img src="../../public/imgs/${achievement.code}.png" alt="${achievement.title}" class="w-15 h-15 object-contain">
			<div>
				<h4 class="font-bold text-sm text-white">${achievement.title}</h4>
				</div>
			</div>
			`;
		}).join('');

		// Show message if no achievements yet
		const achievementsSection = userData.achievements.length > 0 
			? achievementsHtml 
			: '<p class="text-gray-400 text-center py-8 col-span-2">No achievements unlocked yet</p>';


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
	catch (error:any) {
		if ("statusCode" in error) {
			if (error.statusCode == 401){
				history.pushState(null, '', `/login?error=${encodeURIComponent("session expired please login again")}`);
			}
			else {
				history.pushState(null, '', `/home`);
				alert('unexpected server error please try again later')
			}
		}
		else {
			history.pushState(null, '', `/home`);
			alert('connection error please try again later')
		}
		return ""
	}
}