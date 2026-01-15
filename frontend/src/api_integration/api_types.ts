// ==================== Requests Payloads ====================

export interface ApiErrorResponse {
    message: string;
    StatusCode: string;
}

// POST /api/register
export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

// POST /api/login
export interface LoginRequest {
  username: string;
  password: string;
}

// POST /api/2fa/validate
export interface TwoFAValidateRequest {
  code: string;
}

// POST /api/2fa/verify
export interface TwoFAVerifyRequest {
  code: string;
  mfaToken: string;
}

// PATCH /api/user/update
export interface UpdateUserRequest {
  name: string;
  username: string;
  email: string;
}

// PATCH /api/user/update_password
export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
  verifyNewPassword: string;
}

// POST /api/friends/request
export interface FriendRequestRequest {
  receiver_id: number;
}

// POST /api/friends/accept
export interface AcceptFriendRequest {
  request_id: number;
}

// POST /api/friends/reject
export interface RejectFriendRequest {
  request_id: number;
}

// POST /api/friends/block
export interface BlockFriendRequest {
  friend_id: number;
}

// POST /api/friends/unblock
export interface UnblockFriendRequest {
  friend_id: number;
}

// ==================== Request Path variables ====================

// GET /api/user/:id params
export interface UserIdParams {
  id: number;
}

// GET /api/avatar/:id params
export interface AvatarIdParams {
  id: number;
}

// DELETE /api/friends/:id params
export interface DeleteFriendParams {
  id: number;
}

// ==================== Response Types ====================

// Achievement type used in multiple responses
export interface Achievement {
  code: string;
  title: string;
}

// User info in GET /api/me response
export interface CurrentUser {
  id: number;
  name: string;
  username: string;
  email: string;
  level: number;
  games_lost: number;
  games_won: number;
  score: number;
}

// user info in GET /api/personal-info response
export interface UserInfo {
  name: string,
  username: string,
  email: string
}

// GET /api/me response
export interface MeResponse {
  user: CurrentUser;
  levelProgress: number;
  achievements: Achievement[];
}

// User info in GET /api/user/:id response
export interface PublicUser {
  username: string;
  name: string;
  score: number;
  level: number;
}

// GET /api/user/:id response
export interface UserProfileResponse {
  user: PublicUser;
  levelProgress: number;
  achievements: Achievement[];
}

// POST /api/login response when 2FA is enabled
export interface Login2FAResponse {
  mfaToken: string;
}

// POST /api/2fa/generate response
export interface TwoFAGenerateResponse {
  otpAuthUrl: string;
}

// Sender info in friend request
export interface FriendRequestSender {
  id: number;
  username: string;
  name: string;
}

// GET /api/friends/requests response item
export interface FriendRequest {
  id: number;
  status: "PENDING" | "ACCEPTED";
  createdAt: string;
  senderId: number;
  receiverId: number;
  sender: FriendRequestSender;
}

// GET /api/friends/requests response
export type FriendRequestsResponse = FriendRequest[];

// GET /api/user/friends response item
export interface Friend {
  id: number;
  username: string;
  name: string;
  friendshipId: number;
}

// GET /api/user/friends response
export type FriendsListResponse = Friend[];

// GET /api/leaderboard response item
export interface LeaderboardEntry {
  id: number;
  username: string;
  total_xp_points: number;
}

// GET /api/leaderboard response
export type LeaderboardResponse = LeaderboardEntry[];

// GET /api/games/history response item
export interface GameHistoryEntry {
  loser_id: number;
  winner_id: number;
  score: string;
}

//GET /api/games/history response
export type GamesHistoryResponse = GameHistoryEntry[];
