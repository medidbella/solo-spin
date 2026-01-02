import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { SetAccessTokenCookie, SetRefreshTokenCookie} from "./jwt.js";
import { prisma } from "../prisma/database.js";
import { User } from "@prisma/client";
import { GetRandomAvatarPath } from "../users/avatar.js";

declare module 'fastify' {
  interface FastifyInstance {
    githubOAuth2: {
      generateAuthorizationUri: (req: FastifyRequest, res: FastifyReply) => string;
      getAccessTokenFromAuthorizationCodeFlow: (req: FastifyRequest) => Promise<any>;
    };
  }
}

export const OauthCallBackSchema = {
  querystring: {
    type: 'object',
    required: ['code', 'state'],
    properties: {
      code: { type: 'string' },
      state: { type: 'string' },
      error: { type: 'string' }
	}
  }
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export async function githubOauthLogin(req:FastifyRequest, res:FastifyReply)
{
	let githubUrl = await req.server.githubOAuth2.generateAuthorizationUri(req, res);
	// console.log(`generated url: ${githubUrl}`)
	return res.redirect(githubUrl);
}

async function FetchGithubUserData(res:FastifyReply, OauthToken:string)
{
	const userFetchRes = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${OauthToken}`,
			'User-Agent': 'SoloSpin'
		}
	})
	if (!userFetchRes.ok)
		throw new Error(`Failed to fetch user data`)
	let githubUserData = await userFetchRes.json() as GitHubUser
	if (!githubUserData.email) {
		const emailFetchRes = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${OauthToken}`,
				'User-Agent': 'SoloSpin'
			}
		})
		if (!emailFetchRes.ok)
			throw new Error(`Failed to fetch user email`)
		const emailDetails = await emailFetchRes.json() as GitHubEmail[]
		githubUserData.email = emailDetails.find((elm) => elm.primary && elm.verified)?.email || null
		if (!githubUserData.email)
			return res.status(400).send('No Github verified primary email found')
	}
	return githubUserData
}

async function githubOauthAuthenticate(res:FastifyReply, localUser:User, remoteUser:GitHubUser)
{
	if (localUser.oauth_provider != "github")
		return res.status(401).send('email already registered using a different method')
	else if (localUser.email == remoteUser.email && localUser.oauth_id != remoteUser.id.toString())
		return res.status(401).send('email already in use')
	if (localUser.email != remoteUser.email) {
		await prisma.user.update({
			where:{
				id: localUser.id
			},
			data:{
				email: remoteUser.email!
			}
		})
	}
	SetAccessTokenCookie(res, localUser.id)
	const token = SetRefreshTokenCookie(res, localUser.id)
	localUser = await prisma.user.update({
		where: {
			id:localUser.id
		},
		data:{
			refresh_token:token
		}
	})
}

async function githubOauthRegistration(res:FastifyReply, remoteUser:GitHubUser)
{
	const user = await prisma.user.create({
		data:{
			username: remoteUser.login,
			name: remoteUser.name ? remoteUser.name : remoteUser.login,
			email: remoteUser.email!,
			oauth_id: remoteUser.id.toString(),
			oauth_provider: 'github',
			avatar_path: GetRandomAvatarPath()
		},
	})
	SetAccessTokenCookie(res, user.id)
	const token = SetRefreshTokenCookie(res, user.id)
	await prisma.user.update({
		where: {
			id:user.id
		},
		data:{
			refresh_token:token
		}
	})
}

export async function githubOauthRedirectHandler(this:FastifyInstance, req:FastifyRequest, res:FastifyReply)
{
	const { code, state, error } = req.query as { code: string, state: string, error?: string };
	if (error)
      return res.code(403).send(`Authorization failed: ${error}`)

	try {
		const tokenResult = await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    	const accessToken = tokenResult.token.access_token;
		const githubUserData = await FetchGithubUserData(res, accessToken)
		if (res.sent)
			return
		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{oauth_id : githubUserData.id.toString()},
					{email: githubUserData.email!}
				]
			},
		})
		if (user) {
			githubOauthAuthenticate(res, user, githubUserData)
			if (res.sent)
				return
			res.code(200).send("Logged in with github successfully")	
		}
		else { 
			githubOauthRegistration(res, githubUserData)
			res.code(200).send("successfully registered with github")
		}
	}
	catch (error){
		req.log.error(error)
		res.code(500).send("oauth setup failed")
	}
}
