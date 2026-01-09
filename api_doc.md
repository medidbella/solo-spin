# Solo Spin Backend API Documentation

This document describes the API endpoints for the Solo Spin backend. Please follow the request and response formats as described.
---
if any request does not follow its defined schema a response with status : "400 Bad request" will be sent and the error details are mentioned in the body  

## POST `/api/register`
Add a new user to the application.

**Request body schema:**
- name: { type: 'string', minLength: 3 }
- username: { type: 'string', minLength: 4 }
- email: { type: 'string', format: 'email' }
- password: { type: 'string', minLength: 8 }

**Responses:**
- If the schema is not followed -> "400 bad request" + with a proper error message
- If the user name or email already exists -> "409 conflict" + a proper error message
- If there is no error a new user will be added to the DB and access tokens will be assigned as cookies -> "201 created" + success message

---

## POST `/api/login`
Get access to the application as a user.

**Request body schema:**
- username: { type: "string", minLength: 4 }
- password: { type: "string", minLength: 8 }

**Responses:**
- If no user found or the password is wrong -> "401 Unauthorized" + "invalid user name or password"
- If the user has 2FA enabled -> "200 OK" + a jwt token named 2fa_temp, in this case the user should be redirected to a new page where he will be required to enter a 2FA code which will be sent with the previous token to "/api/2FA/verify" only then the tokens will be assigned
- When no error occurs the client will get the access token -> "200 OK"

---

## GET `/api/me`
Fetch all user data. Only a valid access token is required.

**Responses:**
- If no token found or its invalid ->  "401 Unauthorized"
- If the token user id is not found in db -> "401 Unauthorized"
- When all good all the user DB stored data will be sent as JSON example:
  ```
  "user": {
      "id": 2,
      "name": "ali",
      "username": "aakouhar",
      .....
  }
  ```

---

## GET `/api/user/:id`
Get a user's details by their ID.

**Request param schema:**
- id: { type: 'integer', minimum: 1 }

**Responses:**
- Invalid access token -> "403 Unauthorized"
- User not found -> "404 Not found"
- Otherwise -> "200 OK" + the body will be in this format:
  ```json
  {
    "user": {
      "username": "midbella",
      "name": "mohamed",
      "total_xp_points": 1175,
      "level": 3,
      "experience_points": 31
    },
    "levelProgress": 5.29
  }

## POST `/api/refresh`
Used when access token is expired to get a new one. Only a valid refresh token is required.

**Responses:**
- If the refresh token is invalid or the user associated with it does not exist -> "401 Unauthorized"
- If no error occurred a new access token is assigned and the refresh token will change

---

## POST `/api/logout`
Simply invalidate the tokens.

**Responses:**
- In all cases the tokens will be removed -> "200 OK"

---

## POST `/api/2fa/generate`
Generates the 2FA string (first step to activate 2FA). Only access token is checked.

**Responses:**
- Invalid access token -> "401 Unauthorized"
- If no errors occurs -> "201 Created" -> "otpAuthUrl" is set which should be shown as a QR code for the user. This does not enable 2fa yet; user must validate a code first using /api/2fa/validate

---

## POST `/api/2fa/validate`
Validate the user 2fa code to enable 2fa, used after the 2fa/generate route.

**Request body schema:**
- code: { type: "string", minLength: 6, maxLength: 6 }

**Responses:**
- Invalid access token -> "401 Unauthorized"
- Wrong code -> "401 Unauthorized" + message: "Wrong 2FA key, try again"
- Correct code and valid access token -> "201 created" now the user has 2FA enabled

---

## POST `/api/2fa/verify`
To verify a client 2FA code, used after login to 2FA enabled account.

**Request body schema:**
- code: { type: "string", minLength: 6, maxLength: 6 }
- mfaToken: {type: "string"}
  (mfaToken is already sent with the login response body)

**Responses:**
- Invalid mfaToken or the user does not have 2FA enabled or the user not found etc... -> "401 Unauthorized" + proper msg
- Correct code + token -> user gets the access token

---

## GET `/api/login/github`
Redirect the user to the github login page url + proper Oauth queries. Nothing is required, just plain GET request.

**Response:**
- The only response is "302 Found" and a location header is set to the github login endpoint. After the user logs in he will get automatically redirected to the callback url.

---

## GET `/api/login/github/callback`
Users get redirected to this route after logging in the github login page.

**Responses:**
-  if any error occurs the user is redirected back to the app login page with a query variable named error that is assigned the cause the problem, the front end should display it to the user.
-  on success (logged in or registered with the provider) the user is redirected to the home page and jwt tokens are assigned

---

## GET `/api/login/google`
Redirect the user to the google login page url + proper Oauth queries. Nothing is required, just a plain GET request.

**Response:**
- The only response is "302 Found" and a location header is set to the google login endpoint. After the user logs in he will automatically be redirected to the callback url.

---

## GET `/api/login/google/callback`
Users get redirected to this route after logging in the google login page.

**Responses:**
-  if any error occurs the user is redirected back to the app login page with a query variable named error that is assigned the cause the problem, the front end should display it to the user.
-  on success (logged in or registered with the provider) the user is redirected to the home page and jwt tokens are assigned

---

## GET `/api/user/avatar`
Get the logged in user avatar.

- User must have the access token (already authenticated)

**Responses:**
- Invalid access token or the user associated with it not found -> "401 Unauthorized"
- Otherwise the user will receive -> "200 OK" + the raw image in the response body (content-type: image/png)

---

## POST `/api/user/avatar`
Change the logged in user avatar picture.

**Request header schema:**
- properties: { // browser takes care of it when `<form>` is used for the upload
    'content-type': { type: 'string', pattern: '^multipart/form-data' }
  }
- User must have the access token

**Responses:**
- Invalid access token or the user associated with it not found -> "401 Unauthorized"
- The body of the request has no file -> "400 Bad request"
- The image is not of type png -> "400 Bad request"
- More than one file is uploaded in the multipart request -> "400 Bad request"
- File larger than the 3Mb limit -> "400 Bad request"
- Otherwise the user's avatar will be updated -> "200 OK"

---

## GET `/api/avatar/:id`
Get user avatar by id.

**Request param schema:**
- id: { type: 'integer', minimum: 1 }

**Responses:**
- Invalid access token -> "403 Unauthorized"
- User not found -> "404 Not found"
- Otherwise -> "200 OK" + the body will contain the .png image

---

## PATCH `/api/user/update`
Update basic user info.

**Request body schema:**
- name: { type: 'string', minLength: 3 }
- username: { type: 'string', minLength: 4 }
- email: { type: 'string', format: 'email' }
  - Any field can be an empty string meaning the rules min length are only enforced if value not empty, and the empty field will not be updated

**Responses:**
- Invalid access token or the user associated with it not found -> "401 Unauthorized"
- The new email or user name is already taken -> "409 Conflict"
- Otherwise the user info will be updated successfully -> "200 OK"

---

## PATCH `/api/user/update_password`
Change logged in user password.

**Request body schema:**
- oldPassword: { type: 'string' }
- newPassword: { type: 'string', minLength: 8 }
- verifyNewPassword: { type: 'string', minLength: 8 }

**Responses:**
- Invalid access token or the user associated with it not found -> "401 Unauthorized"
- newPassword and verifyNewPassword are not equal -> "400 Bad request"
- old password not the same as the user password ->  "401 Unauthorized"

---

## POST `/api/friends/request`
Make logged in user send a friend request to a user.

**Request body schema:**
- receiver_id: { type: 'integer', minimum: 1 }

**Responses:**
- Invalid access token or the user associated with it not found -> "401 Unauthorized"
- Bad receiver_id format or if equals the logged in user id -> "400 Bad request"
- receiver_id does not exists in DB -> "404 Not found"
- receiver already in the user friends list -> "400 Bad request"
- request already sent -> "409 Conflict"
- receiver has already sent a request to the user -> "200 OK" + the users will be friends now (automatically accepted)
- Otherwise -> "201 created" -> a friend request will be stored with a PENDING state

---

## GET `/api/friends/requests`
List all friend requests sent to the logged in user.

**Responses:**
- Invalid access token or the user associated with it not found -> "401 Unauthorized"
- No error occurs -> "200 OK" + a JSON response that represents the array of requests in the following format:
  ```json
  [
    {
      "id": 9,
      "status": "PENDING",
      "createdAt": "2026-01-03T14:54:09.306Z",
      "senderId": 1,
      "receiverId": 2,
      "sender": {
        "id": 1,
        "username": "midbella",
        "name": "mohamed"
      }
    }
  ]
  ```
  - The array is sorted (desc) by time stamp
  - The array can be empty

---

## GET `/api/user/friends`
List all the friends of the logged in user.

**Responses:**
- Invalid access token or the user associated with it not found -> "401 Unauthorized"
- No error occurs -> "200 OK" + a JSON response that represents the array of friends in the following format:
  ```json
  [
    {
      "id": 1,
      "username": "midbella",
      "name": "mohamed",
      "friendshipId": 9
    }
  ]
  ```
  - The array is sorted (desc) by time stamp
  - The array can be empty

---

## POST `/api/friends/accept`
Accept a pending friend request.

**Request body schema:**
- request_id: { type: 'integer', minimum: 1 }

**Responses:**
- Invalid access token -> "401 Unauthorized"
- Friend request not found -> "404 Not found"
- The request receiver id is not the user id -> "403 Forbidden"
- Friend request already accepted -> "400 Bad request"
- All good -> "200 OK" + the request sender will be a friend of the user

---

## POST `/api/friends/reject`
Reject a pending user friend request.

**Request body schema:**
- request_id: { type: 'integer', minimum: 1 }

**Responses:**
- Invalid access token -> "401 Unauthorized"
- Friend request not found -> "404 Not found"
- The request receiver id is not the user id -> "403 Forbidden"
- Friend request already accepted -> "400 Bad request"
- All good -> "200 OK" + the request will be rejected (will be deleted)

---

## DELETE `/api/friends/:id`
Delete a user from your friend list by id.

**Request param schema:**
- id: { type: 'integer', minimum: 1} // all digits

**Responses:**
- Invalid access token -> "401 Unauthorized"
- The user has no friend with same id -> "404 not found"
- Otherwise the friendship will be removed -> "200 OK"

---

## POST `/api/friends/block`
Make the logged in user block another one (no further messages can be sent between users).

**Request body schema:**
- friend_id: { type: 'integer', minimum: 1 }

**Responses:**
- Invalid token -> "401 Unauthorized"
- friend_id is not in the user friends list (you can only block your friends) -> "404 Not found"
- The friend_id user has already been blocked -> "400 Bad request"
- The friend has already blocked the user -> "400 Bad request"
- When no errors are faced -> "200 OK", successful block meaning the users can not exchange messages

---

## POST `/api/friends/unblock`
Unblock an already blocked friend.

**Request body schema:**
- friend_id: { type: 'integer', minimum: 1 }

**Responses:**
- Invalid token -> "401 Unauthorized"
- friend_id is not in the user friends list (you can only unblock your friends) -> "404 Not found"
- The friend is not blocked -> "400 Bad request"
- The friend is the one who blocked the user -> "403 Forbidden"
- When no errors are faced -> "200 OK", successful unblocked meaning the users can now exchange messages

---

# Internal Routes

The internal routes are only accessible by the chat and game containers (inside the docker network).
A secret must be added in all internal requests as a header named: `x-internal-secret`. This secret is shared between containers. If no correct secret header is found a "404 Not found" response is sent.

---

## POST `/internal/messages`
Make a user send a message to another (they must be friends).

**Request body schema:**
- sender_id: { type: 'integer', minimum: 1 }
- receiver_id: { type: 'integer', minimum: 1 }
- content: { type: 'string', minLength: 1, maxLength: 2000 }

**Responses:**
- The two users are not friends -> "403 Forbidden"
- One of the users has blocked the other -> "400 Bad Request"
- No errors -> "200 OK", the message is now stored

---

## GET `/internal/messages`
Fetch all messages between two users.

**Request query string schema:**
- user1_id: { type: 'integer', minimum: 1 }
- user2_id: { type: 'integer', minimum: 1 }
  - Example: `url:3000/internal/messages?user1_id=1&user2_id=2`

**Responses:**
- The users are not friends -> "404 Not found"
- Otherwise -> "200 OK" + a JSON in the body in the following form:
  ```json
  [
    {
      "id": 1,
      "content": "hello",
      "sentAt": "2026-01-05T15:51:35.287Z",
      "isRead": true,
      "friendshipId": 11,
      "senderId": 1,
      "receiverId": 2
    }
    // ...
  ]
  ```

---

## PATCH `/internal/messages/seen`
Mark all the messages between users as seen.

**Request body schema:**
- user_id: { type: 'integer', minimum: 1 }
- peer_id: { type: 'integer', minimum: 1 }

**Responses:**
- The users are not friends -> "404 Not found"
- All good -> "200 OK", all the messages status is set to seen

---

## POST `/internal/games/`
Store a game result and update user stats.

**Request body schema:**
- winner_id: { type: 'integer', minimum: 1 }
- loser_id: { type: 'integer', minimum: 1 }
- winner_score: { type: 'integer', minimum: 1 }
- loser_score: { type: 'integer', minimum: 0 }

**Responses:**
- winner_score is not greater than loser_score or winner_id equals loser_id -> "400 Bad request"
- winner/loser id not found in the DB -> "404 Not found"
- Otherwise the game will be scored and the winner + user stats will be updated -> "200 OK"

---

# Leaderboard and Games History Endpoints

---

## GET `/api/leaderboard`
Fetch top ranked users based on total XP gained.

**Request query schema:**
- limit: { type: 'integer', minimum: 1 }
  - Example: `https://ip:443/api/leaderboard?limit=2`

**Responses:**
- Invalid token -> "401 Unauthorized"
- Otherwise -> "200 OK" and a sorted list of users will be sent in the response body in this form:
  ```json
  [
    {
      "id": 1,
      "username": "midbella",
      "total_xp_points": 1175
    },
    {
      "id": 2,
      "username": "aakouhar",
      "total_xp_points": 175
    }
    // at most 'limit' number of elements
  ]
  ```

---

## GET `/api/games/history`
Get the last few games.

**Request query schema:**
- limit: { type: 'integer', minimum: 1 }
  - Example: `https://ip:443/api/games/history?limit=2`

**Responses:**
- Invalid access token -> "403 Unauthorized"
- Otherwise -> "200 OK" + the body will contain at most the last 'limit' games, example:
  ```json
  [
    {
      "loser_id": 1,
      "winner_id": 2,
      "score": "5-4"
    },
    {
      "loser_id": 2,
      "winner_id": 1,
      "score": "5-0"
    }
  ]
  ```
