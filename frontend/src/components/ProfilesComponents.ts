import type { Friend, FriendRequest, BlockedUser } from "../api_integration/api_types";

export function renderFriendRow(friend: Friend): string {
  return /* html */ `
    <div class="flex items-center justify-between bg-[#2a1f4e] rounded-lg p-4 mb-3">
      <div class="flex items-center gap-4">
        <img 
          src="/api/avatar/${friend.id}" 
          alt="${friend.username}'s avatar"
          class="w-12 h-12 rounded-full object-cover bg-[#1a1a2e]"
          onerror="this.src='/default-avatar.png'"
        />
        <div>
          <p class="text-white font-medium">${friend.username}</p>
          <p class="text-gray-400 text-sm">@${friend.username}</p>
        </div>
      </div>
      <div class="flex gap-2 ">
        <button 
          class="bg-[#6b4c9a] cursor-pointer hover:bg-[#7d5cb0] text-white px-6 py-2 rounded-md transition-colors"
          data-action="remove-friend"
          data-friendship-id="${friend.friendshipId}"
          data-friend-id="${friend.id}"
        >
          Remove
        </button>
        <button 
          class="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          data-action="block-user"
          data-friend-id="${friend.id}"
          data-friendship-id="${friend.friendshipId}"
          >
            Block
        </button>
      </div>
    </div>
  `;
}

export function renderFriendsList(friends: Friend[]): string {
  if (friends.length === 0) {
    return /* html */ `
      <div class="text-center text-gray-400 py-12">
        <i class="fas fa-user-friends text-4xl mb-4"></i>
        <p>No friends yet. Start connecting!</p>
      </div>
    `;
  }
  return friends.map(renderFriendRow).join("");
}

export function renderRequestRow(request: FriendRequest): string {
  return /* html */ `
    <div class="flex items-center justify-between bg-[#2a1f4e] rounded-lg p-4 mb-3">
      <div class="flex items-center gap-4">
        <img 
          src="/api/avatar/${request.sender.id}" 
          alt="${request.sender.username}'s avatar"
          class="w-12 h-12 rounded-full object-cover bg-[#1a1a2e]"
          onerror="this.src='/default-avatar.png'"
        />
        <div>
          <p class="text-white font-medium">${request.sender.name}</p>
          <p class="text-gray-400 text-sm">@${request.sender.username}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button 
          class="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded-md transition-colors"
          data-action="accept-request"
          data-request-id="${request.id}"
        >
          Accept
        </button>
        <button 
          class="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-4 py-2 rounded-md transition-colors"
          data-action="reject-request"
          data-request-id="${request.id}"
        >
          Reject
        </button>
      </div>
    </div>
  `;
}

export function renderRequestsList(requests: FriendRequest[]): string {
  if (requests.length === 0) {
    return /* html */ `
      <div class="text-center text-gray-400 py-12">
        <i class="fas fa-inbox text-4xl mb-4"></i>
        <p>No pending friend requests</p>
      </div>
    `;
  }
  return requests.map(renderRequestRow).join("");
}

export function renderBlockedRow(user: BlockedUser): string {
  return /* html */ `
    <div class="flex items-center justify-between bg-[#2a1f4e] rounded-lg p-4 mb-3">
      <div class="flex items-center gap-4">
        <img 
          src="/api/avatar/${user.id}" 
          alt="${user.username}'s avatar"
          class="w-12 h-12 rounded-full object-cover bg-[#1a1a2e] grayscale"
          onerror="this.src='/default-avatar.png'"
        />
        <div>
          <p class="text-white font-medium">${user.name}</p>
          <p class="text-gray-400 text-sm">@${user.username}</p>
        </div>
      </div>
      <button 
        class="bg-[#6b4c9a] hover:bg-[#7d5cb0] cursor-pointer text-white px-6 py-2 rounded-md transition-colors"
        data-action="unblock-user"
        data-user-id="${user.id}"
      >
        Unblock
      </button>
    </div>
  `;
}

export function renderBlockedList(users: BlockedUser[]): string {
  if (users.length === 0) {
    return /* html */ `
      <div class="text-center text-gray-400 py-12">
        <i class="fas fa-ban text-4xl mb-4"></i>
        <p>No blocked users</p>
      </div>
    `;
  }
  return users.map(renderBlockedRow).join("");
}