export function renderLandingPage() : string {
    return `
    <img class="absolute top-2.5 left-[50px] w-[250px] " src="imgs/logo.png" alt="soloSpin logo">
        <section class="relative z-1 flex justify-between items-center h-screen py-0 px-20">
            <div class="max-w-[700px] pt-[90px]">
                <h1 class="text-[40px] font-teachers font-medium text-[#f2f2f2] leading-[1.2] mb-[60px]"><span class="font-['solo',serif] text-[90px] text-[#6e04b6]">From Shadow to Champion</span> <br> Train, evolve, and awaken your hidden strength — the table awaits your power</h1>
                <button class="bg-linear-to-r from-[#3d1fa2] to-[#6245ff] text-white font-[solo] text-4xl border-none py-4 px-6 rounded-md shadow-[0_0_15px_#4b1dcb] cursor-pointer hover:shadow-[0_0_25px_#7b35ff] hover:scale-105">Start Your Journey</button>
            </div>
            <div class="energy-aura"></div>
            <img class="w-[700px] h-auto self-stretch animate-float" src="imgs/person.svg" alt="person">
        </section>
    `;
}

