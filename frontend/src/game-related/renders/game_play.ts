
import gamePlayContent from '../pages/game_play.html?raw';
import { renderHeader } from '../../components/Header';

// import { withLayout } from './layout';
// import { navigateTo } from '../services/handle_pong_routes';

function withGameLayout(contentHTML: string): string {
    return /* html */ `
    <div class="flex flex-col h-screen w-full bg-[#0f0c18] text-white select-none overflow-hidden">
        
        ${renderHeader()} 

        <main class="flex-1 flex items-center justify-center relative w-full h-full">
            ${contentHTML}
        </main>
    </div>
    `;
}


// 1. Render Function
export function renderGamePlayPage(): string {
	return withGameLayout(gamePlayContent);
}

