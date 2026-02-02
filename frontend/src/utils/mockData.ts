import type { Friend, FriendRequest, BlockedUser } from "../api_integration/api_types";


// Mock data matching GET /api/user/friends response
export const mockFriends: Friend[] = [
  { id: 1, username: "player_one", name: "Alex Johnson", friendshipId: 101 },
  { id: 2, username: "gamer_girl", name: "Sarah Chen", friendshipId: 102 },
  { id: 3, username: "pro_spinner", name: "Mike Davis", friendshipId: 103 },
  { id: 4, username: "night_owl", name: "Emma Wilson", friendshipId: 104 },
];

// Mock data matching GET /api/friends/requests response
export const mockRequests: FriendRequest[] = [
  {
    id: 201,
    status: "PENDING",
    createdAt: "2026-01-15T10:30:00Z",
    senderId: 5,
    receiverId: 1, // current user
    sender: { id: 5, username: "new_challenger", name: "Tom Hardy" },
  },
  {
    id: 202,
    status: "PENDING",
    createdAt: "2026-01-18T14:20:00Z",
    senderId: 6,
    receiverId: 1,
    sender: { id: 6, username: "ping_master", name: "Lisa Park" },
  },
];

// Mock data matching GET /api/friends/blocked response
export const mockBlocked: BlockedUser[] = [
  { id: 7, username: "toxic_player", name: "Bad Actor" },
  { id: 8, username: "spammer_99", name: "Spam Bot" },
];