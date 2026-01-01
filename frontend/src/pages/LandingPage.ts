export function renderLandingPage() : string {
    return /* html */`
    <img class="absolute top-2.5 left-[50px] w-[250px] " src="imgs/logo.png" alt="soloSpin logo">
        <section class="relative z-1 flex justify-between items-center h-screen py-0 px-20">
            <div class="max-w-[700px] pt-[90px]">
                <h1 class="text-[40px] font-teachers font-medium text-[#f2f2f2] leading-[1.2] mb-[60px]"><span class="font-['solo',serif] text-[90px] text-[#6e04b6]">From Shadow to Champion</span> <br> Train, evolve, and awaken your hidden strength — the table awaits your power</h1>
                
                <a href="/login" data-link class="inline-block bg-linear-to-r from-[#3d1fa2] to-[#6245ff] text-white font-[solo] text-4xl border-none py-4 px-6 shadow-[-10px_-10px_0px_#441563] cursor-pointer hover:scale-105 transition-transform no-underline">
                    Start Your Journey
                </a>

            </div>
            <div class="energy-aura"></div>
            <img class="w-[700px] h-auto self-stretch animate-float" src="imgs/person.svg" alt="person">
        </section>
    `;
}