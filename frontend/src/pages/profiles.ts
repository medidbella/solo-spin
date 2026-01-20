import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { mockFriends, mockBlocked, mockRequests } from "../utils/mockData";
import { renderBlockedList, renderRequestsList , renderFriendsList } from "../components/ProfilesComponents";

// this type can take one of the tree values only (string literal union type)
type TabType = "friends" | "requests" | "blocked";

//this is a global varaible that visibale on all functions
let activeTab: TabType = "friends";

//this function to render the content inside the centred container based on where we are now
function getTabContent(): string {
  switch(activeTab)
  {
    case "friends":
      return renderFriendsList(mockFriends);
    case "blocked":
      return renderBlockedList(mockBlocked);
    case "requests":
      return renderRequestsList(mockRequests);
    default:
      return "";
  }
}

//this function built to return the stylin of class bar based on its state
function getTabClasses(tab: TabType) : string{
  const baseClasses = "flex-1 py-4  text-[#f2f2f2] text-center font-semibold text-lg shadow-[-5px_-5px_0px_#441563]";

  if (tab === activeTab)
  {
    return `${baseClasses} bg-[3b82f6]`;
  }
  return `${baseClasses} bg-[6b2f8a]`;
}

//this function render only the navbar with a costom style for the active tab to make special between other tabs
function renderTabBar(): string {
  return /* html */ `
    <div class="flex rounded-t-lg overflow-hidden">
      <button
        class="${getTabClasses("friends")}"
        data-tab="friends"
      >
        Friends
      </button>
      <button
        class="${getTabClasses("requests")}"
        data-tab="requests"
      >
        Request
      </button>
      <button
        class="${getTabClasses("blocked")}"
        data-tab="blocked"
      >
        Blocked
      </button>
    </div>
  `
}


//this is an update function that will change only the centred contaired that hold all lists
function updateTabUI() : void{
  const tabBar = document.getElementById("profiles-tab-bat");
  const contentArea = document.getElementById("profiles-content");

  if (tabBar)
  {
    tabBar.innerHTML = renderTabBar();
  }
  if (contentArea)
  {
    contentArea.innerHTML = getTabContent();
  }
}








export function renderProfilesPage(): string {
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
      
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto p-8 relative">
            <h1 class="text-5xl text-red-700" >profiles page in progress</h1>
        </section>
      </div>
    </main>
  `;
}