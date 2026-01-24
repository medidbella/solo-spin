import { apiFetch } from "./api_fetch";
import type {
    FriendsListResponse,
    FriendRequestsResponse,
    BlockedUser,
    GeneralSuccessRes,
    AcceptFriendRequest,
    RejectFriendRequest,
    BlockFriendRequest,
    UnblockFriendRequest,
} from "./api_types";

// GET here all Friends list
export async function getFriendsList() : Promise<FriendsListResponse>
{
    return apiFetch<FriendsListResponse>("/api/user/friends");
}

// GET all friend requests and returning it as an array
export async function getFriendRequests(): Promise<FriendRequestsResponse>
{
    return apiFetch<FriendRequestsResponse>("api/friends/requests");
}
// GET here all blocked users
export async function getBlockedUsers(): Promise<BlockedUser[]>{
    return apiFetch<BlockedUser[]>("/api/friends/blocked");
}

//REMOVE a friend here using his friendId
export async function removeFriend(friendId: number) : Promise<GeneralSuccessRes>{
    return apiFetch<GeneralSuccessRes>(`/api/friends/${friendId}`,
        { method: "DELETE",}
    );
}

// POST block user using his id
export async function blockUser(friendId: number): Promise<GeneralSuccessRes>{
    const body: BlockFriendRequest = {friend_id : friendId};
    return apiFetch<GeneralSuccessRes>("/api/friends/block", {
        method: "POST",
        body: JSON.stringify(body),
    });
}


export async function unblockUser(friendId: number) : Promise<GeneralSuccessRes>
{
    const body: UnblockFriendRequest = { friend_id: friendId};
    return apiFetch<GeneralSuccessRes>("/api/friends/unblock", {
        method: "POST",
        body: JSON.stringify(body),
    });
}
//POST accept a friend
export async function acceptFriendRequest(requestId: number): Promise<GeneralSuccessRes> {
  const body: AcceptFriendRequest = { request_id: requestId };
  return apiFetch<GeneralSuccessRes>("/api/friends/accept", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
//POST reject a friend 
export async function rejectFriendRequest(requestId: number): Promise<GeneralSuccessRes> {
  const body: RejectFriendRequest = { request_id: requestId };
  return apiFetch<GeneralSuccessRes>("/api/friends/reject", {
    method: "POST",
    body: JSON.stringify(body),
  });
}