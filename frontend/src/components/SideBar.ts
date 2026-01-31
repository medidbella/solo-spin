interface NavLink {
  href: string;
  label: string;
  icon: string;
}

export function renderSideBar(): string {
  const currentPath = window.location.pathname;

  const navLinks: NavLink[] = [
    { href: '/home', label: 'Home', icon: 'fa-solid fa-house' },
    { href: '/chat', label: 'chat', icon: 'fa-regular fa-message' },
    { href: '/profile', label: 'profile', icon: 'fa-solid fa-user' },
    { href: '/game', label: 'game', icon: 'fa-solid fa-table-tennis-paddle-ball' },
    { href: '/profiles', label: 'profiles', icon: 'fa-solid fa-user-group' },
    { href: '/leaderBoard', label: 'Leader-board', icon: 'fa-solid fa-trophy' },
    { href: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' },
  ];

  const linksHtml = navLinks.map((link) => {
    const isActive = currentPath === link.href;
    const activeClass = isActive ? 'text-[#F2F2F2] scale-110' : 'text-[#2A3FA1]';

    return `
      <a href="${link.href}" 
         data-link 
         aria-label="${link.label}" 
         class="${activeClass} w-10 h-10 flex items-center justify-center hover:text-white hover:scale-110 duration-200 transition-all">
        <i class="${link.icon}"></i>
      </a>
    `;
  }).join('');

  return /* html */ `
    <aside class="fixed bottom-0 left-0 w-full lg:relative lg:w-20 lg:h-full flex flex-row lg:flex-col items-center justify-center py-4 lg:py-6 text-xl bg-black/20 lg:bg-transparent backdrop-blur-md z-50">
      <nav class="flex flex-row lg:flex-col gap-6 lg:gap-4 w-full justify-evenly lg:justify-center">
        ${linksHtml}
      </nav>
    </aside>
  `;
}