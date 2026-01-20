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
  const baseClasses = "flex-1 py-4 font-[#solo] cursor-pointer text-[#f2f2f2] text-center font-semibold text-lg shadow-[-5px_-5px_0px_#441563]";

  if (tab === activeTab)
  {
    return `${baseClasses} bg-[#2A3FA1]`;
  }
  return `${baseClasses} bg-[#441563]`;
}

//this function render only the navbar with a costom style for the active tab to make special between other tabs
function renderTabBar(): string {
  return /* html */ `
    <div class="flex  overflow-hidden">
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
  const tabBar = document.getElementById("profiles-tab-bar");
  const contentArea = document.getElementById("profiles-content");

  if (tabBar)
  {
    console.log("i am here");
    tabBar.innerHTML = renderTabBar();
  }
  if (contentArea)
  {
    contentArea.innerHTML = getTabContent();
  }
}

export function setupProfilesPageLogic() : void {
  const container = document.getElementById("profiles-container");
  if (!container) return;

  container.addEventListener("click", (e) =>{
    const target = e.target as HTMLLinkElement;
    //handele tab switching to style active and non active tabs
    const tabButton = target.closest("[data-tab") as HTMLElement;
    if (tabButton)
    {
      //getting here the object buttong that the user want to navigate to its content
      const newTab = tabButton.dataset.tab as TabType;
      if (newTab && newTab !== activeTab)
      {
        activeTab = newTab;
        updateTabUI();
      }
      return;
    }
    //handele all action buttons
    const actionButton = target.closest("[data-action]") as HTMLElement;
    if (actionButton)
    {
      const action = actionButton.dataset.action;

      switch(action){
        case "remove-friend":
          const friendshipId = actionButton.dataset.friendshipId;
          console.log(`here i should call the api using this friendshipId  ${friendshipId}`);
          break;
        case "accept-request":
          const requestId = actionButton.dataset.requestId;
          console.log(`call here an api using post methode here is the friendshipId ${requestId}`);
          break;
        case "reject-request":
          const rejectId = actionButton.dataset.requestId;
          console.log(`a post methode should treat here later here is the requestId should be rejected ${rejectId}`);
          break;
        case "unblock-user":
          const userId = actionButton.dataset.userId;
          console.log(`TODO: post request to block with friendId ${userId}`);
      }
    }
  });
}

//the main rendering profiles function
export function renderProfilesPage(): string {
  activeTab = "friends" //make the content list as a defualt
  return /* html */`
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
      
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto p-8 items-center">
        <!-- THIS IS THE MAIN CONTAINER -->
        <div id="profiles-container" class="max-w-4xl mx-auto bg-[#2A3FA1] shadow-[-10px_-10px_0px_#441563]">
          <!-- Tab Bar -->
          <div id="profiles-tab-bar">
            ${renderTabBar()}
          </div>
          <!-- Content Area -->
          <div id="profiles-content" class="bg-[#2A3FA1] rounded-b-lg p-6 min-h-[400px]">
            ${getTabContent()}
          </div>
        </div>

        </section>
      </div>
    </main>
  `;
}