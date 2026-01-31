// Define what a navigation link looks like
interface NavLink {
  href: string;
  label: string;
  icon: string;
}

export function renderSideBar(): string {
  // 1. Get the current path from the browser (e.g., "/chat")
  const currentPath = window.location.pathname;

  // 2. Define your links in an array (Easier to manage!)
  const navLinks: NavLink[] = [
    { href: '/home', label: 'Home', icon: 'fa-solid fa-house' },
    { href: '/chat', label: 'chat', icon: 'fa-regular fa-message' },
    { href: '/profile', label: 'profile', icon: 'fa-solid fa-user' },
    { href: '/games/pong/', label: 'game', icon: 'fa-solid fa-table-tennis-paddle-ball' },
    { href: '/profiles', label: 'profiles', icon: 'fa-solid fa-user-group' },
    { href: '/leaderBoard', label: 'Leader-board', icon: 'fa-solid fa-trophy' },
    { href: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' },
  ];

  // 3. Generate the HTML strings for the links
  // We use .map() to transform data into HTML string
  const linksHtml = navLinks.map((link) => {
    // CHECK: Is this link the active one?
    const isActive = currentPath === link.href;

    // CONDITIONAL CLASS: 
    // If active: Text is White (#F2F2F2)
    // If inactive: Text is inherited/Blue (or you can force a color)
    // Note: I removed the hardcoded class on the Home button so logic applies to all.
    const activeClass = isActive ? 'text-[#F2F2F2] scale-110' : 'text-[#2A3FA1]';

    return `
      <a href="${link.href}" 
         data-link 
         aria-label="${link.label}" 
         class="${activeClass} w-10 h-10 flex items-center justify-center hover:text-white hover:scale-110 duration-200 transition-all">
        <i class="${link.icon}"></i>
      </a>
    `;
  }).join(''); // Join the array of strings into one big string

  // 4. Return the full container
  return /* html */ `
    <aside class="w-20 flex flex-col items-center justify-center py-6 text-xl bg-opacity-10 backdrop-blur-md">
      <nav class="flex flex-col gap-4">
        ${linksHtml}
      </nav>
    </aside>
  `;
}