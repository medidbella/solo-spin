export function renderLandingPage() : string {
return /* html */`
    <img class="absolute top-2.5 left-1/2 -translate-x-1/2 lg:left-[50px] lg:translate-x-0 w-[180px] lg:w-[250px] z-10" src="imgs/logo.png" alt="soloSpin logo">
        <section class="relative z-1 flex flex-col lg:flex-row justify-center lg:justify-between items-center h-screen py-0 px-6 lg:px-20 text-center lg:text-left">
            <div class="max-w-[700px] pt-[60px] lg:pt-[90px]">
                <h1 class="text-[28px] md:text-[34px] lg:text-[40px] font-teachers font-medium text-[#f2f2f2] leading-[1.2] mb-8 lg:mb-[60px]">
                    <span class="font-['solo',serif] text-[50px] md:text-[70px] lg:text-[90px] text-[#6e04b6] block mb-2">From Shadow to Champion</span> 
                    <br class="hidden md:block"> Train, evolve, and awaken your hidden strength — the table awaits your power
                </h1>
                
                <a href="/login" data-link class="inline-block bg-linear-to-r from-[#3d1fa2] to-[#6245ff] text-white font-[solo] text-2xl lg:text-4xl border-none py-3 px-6 lg:py-4 lg:px-6 shadow-[-6px_-6px_0px_#441563] lg:shadow-[-10px_-10px_0px_#441563] cursor-pointer hover:scale-105 transition-transform no-underline">
                    Start Your Journey
                </a>
            </div>
            <div class="energy-aura"></div>
            <img class="hidden lg:block w-[700px] h-auto self-stretch animate-float" src="imgs/person.svg" alt="person">
        </section>
    `;
}