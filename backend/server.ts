import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastifyOauth2 from "@fastify/oauth2"
import { register, registrationSchema } from "./auth/register.js";
import { login, loginSchema } from './auth/login.js';
import { authVerifier } from './auth/jwt.js';
import { refresh } from './auth/refresh.js';
import { me, getUserProfile, fetchUserDataSchema, personalInfos} from "./users/profile.js";
import { logout } from "./auth/logout.js"
import {
  twoFaVerifySchema, twoFaValidatorSchema, EnableTwoFactoAuth,
  TwoFactorValidator, TwoFactorLoginVerify
} from './auth/totp.js';
import { 
  OauthCallBackSchema, githubOauthLogin,
  githubOauthRedirectHandler
} from './auth/github_oauth.js';
import{ googleOauthLogin, googleOauthRedirectHandler} from "./auth/google_oauth.js"
import {
  avatarUploadSchema, GetLoggedUserAvatar, 
  updateUserAvatar, fetchAvatarSchema, GetUserAvatar
}
from "./users/avatar.js";
import fastifyMultipart from '@fastify/multipart';
import {
  UserDataUpdateSchema, inputCleaner,
  updateUserInfo, PasswordUpdateSchema,
  updateUserPassword
} from "./users/update_info.js";
import {
  friendRequestActionSchema, friendRequestSchema,
  unfriendSchema, sendFriendRequest, listFriendRequests,
  listFriends, acceptRequest, rejectRequest, removeFriendship,
  friendBlockSchema, blockFriend, unBlockFriend
} from './users/friendship.js'
import {
  storeMessageSchema, listMessagesSchema,
  listMessages, storeMessage, 
  markConversationSeen, markConversationSeenSchema
} from './users/messages.js'
import {
  storeMatchSchema, storeMatchResult,
  gameHistorySchema, gameLeaderboardSchema,
  getGameHistory, getLeaderboard
} from './users/games.js'



const app = Fastify({
  logger: {
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: { 
            destination: './logs/backend.log', 
            mkdir: true 
          }
        },
        {
          target: 'pino-pretty',
          options: { 
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname' 
          }
        }
      ]
    }
  } 
});

app.register(fastifyCookie)

app.register(fastifyMultipart, {
        limits: {
            fileSize: 3 * 1024 * 1024,//3 mb size limit
            files: 1
        }
});

app.register(fastifyJwt, {
  secret: process.env.JWT_ACCESS_SECRET!,
  cookie: {
    cookieName: 'accessToken',
    signed: false
  }
})

app.register(fastifyOauth2, {
  name: 'googleOAuth2',
  credentials: {
    client: {
      id: process.env.GOOGLE_OAUTH_ID!,
      secret: process.env.GOOGLE_OAUTH_SECRET!,
    },
  auth: {
    authorizeHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
    tokenHost: 'https://oauth2.googleapis.com',
    tokenPath: '/token'
  }
  },
  callbackUri: "https://localhost:8443/api/login/google/callback",
  scope: ['openid', 'profile', 'email']
});

app.register(fastifyOauth2, {
  name: 'githubOAuth2',
  credentials: {
    client: {
      id: process.env.GITHUB_OAUTH_ID!,
      secret: process.env.GITHUB_OAUTH_SECRET!,
    },
    auth: {
      authorizeHost: 'https://github.com',
      authorizePath: '/login/oauth/authorize',
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token'
    }
  },
  callbackUri: "https://localhost:8443/api/login/github/callback",
  scope: ['read:user', 'user:email']
});

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

if (process.env.NODE_ENV != "development")
{
  app.addHook('onRequest', async (req:FastifyRequest, res:FastifyReply) => {
    if (req.url.startsWith('/internal')) {
      const key = req.headers['x-internal-secret'];
      if (key !== INTERNAL_SECRET) {
        return res.code(404).send({message: "Not found", statusCode: 404});
      }
    }
  });
}

app.post("/api/register", { schema: registrationSchema }, register)

app.post("/api/login", { schema: loginSchema }, login)

app.get("/api/me", { preHandler: authVerifier }, me)

app.get("/api/personal-info", { preHandler: authVerifier }, personalInfos)

app.get("/api/user/:id", {preHandler: authVerifier, schema: fetchUserDataSchema}, getUserProfile)

app.post("/api/refresh", refresh)

app.post("/api/logout", logout)

app.post("/api/2fa/generate", { preHandler: authVerifier }, EnableTwoFactoAuth)

app.post("/api/2fa/validate", { schema: twoFaValidatorSchema, preHandler: authVerifier },
  TwoFactorValidator)

app.post("/api/2fa/verify", { schema: twoFaVerifySchema }, TwoFactorLoginVerify)

app.get("/api/login/github", githubOauthLogin)

app.get("/api/login/github/callback",{schema: OauthCallBackSchema} ,githubOauthRedirectHandler)

app.get("/api/login/google", googleOauthLogin)

app.get("/api/login/google/callback",{schema: OauthCallBackSchema} ,googleOauthRedirectHandler)

app.get("/api/user/avatar", { preHandler: authVerifier }, GetLoggedUserAvatar)

app.get("/api/avatar/:id", {preHandler: authVerifier, schema: fetchAvatarSchema}, GetUserAvatar)

app.post("/api/user/avatar", {schema: avatarUploadSchema, preHandler: authVerifier }, updateUserAvatar)

app.patch("/api/user/update", { preHandler: authVerifier, preValidation: inputCleaner,
		schema: UserDataUpdateSchema }, updateUserInfo) 

app.patch("/api/user/update_password", { preHandler: authVerifier, schema: PasswordUpdateSchema }, updateUserPassword)

app.post("/api/friends/request", { preHandler: authVerifier, schema: friendRequestSchema }, sendFriendRequest)

app.get("/api/friends/requests", { preHandler: authVerifier }, listFriendRequests)

app.get("/api/user/friends", { preHandler: authVerifier }, listFriends)

app.post("/api/friends/accept", { preHandler: authVerifier, schema: friendRequestActionSchema }, acceptRequest)

app.post("/api/friends/reject", { preHandler: authVerifier, schema: friendRequestActionSchema }, rejectRequest)

app.delete("/api/friends/:id", { preHandler: authVerifier, schema: unfriendSchema }, removeFriendship)  

app.post("/api/friends/block", {preHandler: authVerifier, schema: friendBlockSchema}, blockFriend)

app.post("/api/friends/unblock", {preHandler: authVerifier, schema: friendBlockSchema}, unBlockFriend)

const protectedRoutesPrefix = process.env.NODE_ENV == "development" ? 'api' : 'internal'  

app.post(`/${protectedRoutesPrefix}/messages`, {schema: storeMessageSchema}, storeMessage)

app.get(`/${protectedRoutesPrefix}/messages`, {schema: listMessagesSchema}, listMessages)

app.patch(`/${protectedRoutesPrefix}/messages/seen`, {schema: markConversationSeenSchema}, markConversationSeen) 

app.post(`/${protectedRoutesPrefix}/games`, {schema: storeMatchSchema}, storeMatchResult)

app.get("/api/leaderboard", {preHandler:authVerifier, schema:gameLeaderboardSchema}, getLeaderboard)

app.get("/api/games/history", {preHandler:authVerifier, schema:gameHistorySchema}, getGameHistory)

await app.ready()

console.log(app.printRoutes());

app.listen({ port: 3000, host: '0.0.0.0'});

