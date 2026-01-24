import { renderHeader } from "../components/Header";
import { renderSideBar } from "../components/SideBar";
import { renderBlockedList, renderRequestsList, renderFriendsList } from "../components/ProfilesComponents";
import type { Friend, FriendRequest, BlockedUser } from "../api_integration/api_types";
import {
  getFriendsList,
  getFriendRequests,
  getBlockedUsers,
  removeFriend,
  blockUser,
  unblockUser,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../api_integration/api_friendship";

type TabType = "friends" | "requests" | "blocked";

let activeTab: TabType = "friends";
let friendsData: Friend[] = [];
let requestsData: FriendRequest[] = [];
let blockedData: BlockedUser[] = [];

function showLoading(): void {
  const contentArea = document.getElementById("profiles-content");
  if (contentArea) {
    contentArea.innerHTML = /* html */ `
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    `;
  }
}

function showError(message: string): void {
  const contentArea = document.getElementById("profiles-content");
  if (contentArea) {
    contentArea.innerHTML = /* html */ `
      <div class="text-center text-red-400 py-12">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>${message}</p>
        <button 
          class="mt-4 bg-[#6b4c9a] hover:bg-[#7d5cb0] text-white px-4 py-2 rounded-md"
          data-action="retry-fetch"
        >
          Try Again
        </button>
      </div>
    `;
  }
}

async function fetchTabData(): Promise<void> {
  showLoading();

  try {
    switch (activeTab) {
      case "friends":
        friendsData = await getFriendsList();
        break;
      case "requests":
        requestsData = await getFriendRequests();
        break;
      case "blocked":
        blockedData = await getBlockedUsers();
        break;
    }
    renderTabContent();
  } catch (error: any) {
    console.error(`Failed to fetch ${activeTab} data:`, error);
    showError(error.message || "Failed to load data. Please try again.");
  }
}

function renderTabContent(): void {
  const contentArea = document.getElementById("profiles-content");
  if (!contentArea) return;

  switch (activeTab) {
    case "friends":
      contentArea.innerHTML = renderFriendsList(friendsData);
      break;
    case "requests":
      contentArea.innerHTML = renderRequestsList(requestsData);
      break;
    case "blocked":
      contentArea.innerHTML = renderBlockedList(blockedData);
      break;
  }
}

function getTabClasses(tab: TabType): string {
  const baseClasses = "flex-1 py-4 font-[solo] cursor-pointer text-[#f2f2f2] text-center font-semibold text-4xl shadow-[-5px_-5px_0px_#441563]";

  if (tab === activeTab) {
    return `${baseClasses} bg-[#2A3FA1]`;
  }
  return `${baseClasses} bg-[#441563]`;
}

function renderTabBar(): string {
  return /* html */ `
    <div class="flex overflow-hidden">
      <button class="${getTabClasses("friends")}" data-tab="friends">
        Friends
      </button>
      <button class="${getTabClasses("requests")}" data-tab="requests">
        Request
      </button>
      <button class="${getTabClasses("blocked")}" data-tab="blocked">
        Blocked
      </button>
    </div>
  `;
}

function updateTabBar(): void {
  const tabBar = document.getElementById("profiles-tab-bar");
  if (tabBar) {
    tabBar.innerHTML = renderTabBar();
  }
}

function removeRowFromDOM(selector: string): void {
  const row = document.querySelector(selector);
  if (row) {
    row.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => row.remove(), 300);
  }
}

async function handleAction(action: string, button: HTMLElement): Promise<void> {
  // Disable button to prevent double clicks
  button.setAttribute("disabled", "true");
  button.classList.add("opacity-50", "cursor-not-allowed");

  try {
    switch (action) {
      case "remove-friend": {
        const friendId = Number(button.dataset.friendId);
        await removeFriend(friendId);
        friendsData = friendsData.filter((f) => f.id !== friendId);
        removeRowFromDOM(`[data-friend-row="${friendId}"]`);
        break;
      }

      case "block-user": {
        const friendId = Number(button.dataset.friendId);
        await blockUser(friendId);
        friendsData = friendsData.filter((f) => f.id !== friendId);
        removeRowFromDOM(`[data-friend-row="${friendId}"]`);
        break;
      }

      case "unblock-user": {
        const userId = Number(button.dataset.userId);
        await unblockUser(userId);
        blockedData = blockedData.filter((u) => u.id !== userId);
        removeRowFromDOM(`[data-blocked-row="${userId}"]`);
        break;
      }

      case "accept-request": {
        const requestId = Number(button.dataset.requestId);
        await acceptFriendRequest(requestId);
        requestsData = requestsData.filter((r) => r.id !== requestId);
        removeRowFromDOM(`[data-request-row="${requestId}"]`);
        friendsData = [];
        break;
      }

      case "reject-request": {
        const requestId = Number(button.dataset.requestId);
        await rejectFriendRequest(requestId);
        requestsData = requestsData.filter((r) => r.id !== requestId);
        removeRowFromDOM(`[data-request-row="${requestId}"]`);
        break;
      }

      case "retry-fetch": {
        await fetchTabData();
        break;
      }
    }
  } catch (error: any) {
    console.error(`Action ${action} failed:`, error);
    alert(error.message || "Action failed. Please try again.");
    button.removeAttribute("disabled");
    button.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

export function setupProfilesPageLogic(): void {
  const container = document.getElementById("profiles-container");
  if (!container) return;

  fetchTabData();

  container.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    const tabButton = target.closest("[data-tab]") as HTMLElement;
    if (tabButton) {
      const newTab = tabButton.dataset.tab as TabType;
      if (newTab && newTab !== activeTab) {
        activeTab = newTab;
        updateTabBar();
        
        const hasData =
          (activeTab === "friends" && friendsData.length > 0) ||
          (activeTab === "requests" && requestsData.length > 0) ||
          (activeTab === "blocked" && blockedData.length > 0);

        if (hasData) {
          renderTabContent();
        } else {
          await fetchTabData();
        }
      }
      return;
    }

    const actionButton = target.closest("[data-action]") as HTMLElement;
    if (actionButton) {
      const action = actionButton.dataset.action;
      if (action) {
        await handleAction(action, actionButton);
      }
    }
  });
}

export function renderProfilesPage(): string {
  activeTab = "friends";
  friendsData = [];
  requestsData = [];
  blockedData = [];

  return /* html */ `
    <main class="h-screen flex flex-col bg-[#0e071e] text-white font-sans overflow-hidden">
      
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        
        ${renderSideBar()}
        
        <section class="flex-1 overflow-y-auto p-8 items-center">
          <div id="profiles-container" class="max-w-4xl mx-auto bg-[#2A3FA1] shadow-[-10px_-10px_0px_#441563]">
            <div id="profiles-tab-bar">
              ${renderTabBar()}
            </div>
            <div id="profiles-content" class="bg-[#2A3FA1] rounded-b-lg p-6 min-h-[400px]">
              <div class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  `;
}