# Solo Spin Backend API Documentation

This document describes the API endpoints for the Solo Spin backend. Please follow the request and response formats as described.

---

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
- All the possible responses are demonstrated in a graph (check the tldraw link)

---

## GET `/api/login/google`
Redirect the user to the google login page url + proper Oauth queries. Nothing is required, just a plain GET request.

**Response:**
- The only response is "302 Found" and a location header is set to the google login endpoint. After the user logs in he will automatically be redirected to the callback url.

---

## GET `/api/login/google/callback`
Users get redirected to this route after logging in the google login page.

**Responses:**
- All the possible responses are demonstrated in a graph (check the tldraw link)

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
- Otherwise the user's avatar will be updated -> "200 OK"

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