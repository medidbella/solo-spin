import { renderHeader } from '../../components/Header';
import { renderSideBar } from '../../components/SideBar';

function withLayout(contentHTML: string): string {
    return /* html */ `
    <div class="flex flex-col h-screen w-full bg-gray-900 text-white">
        
        ${renderHeader()}

        <div class="flex flex-1 overflow-hidden">
            
            ${renderSideBar()}

            <main class="flex-1 flex items-center justify-center relative p-4 overflow-auto">
                ${contentHTML}
            </main>
        </div>
    </div>
    `;
}

export { withLayout };