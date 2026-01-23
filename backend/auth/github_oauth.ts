import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { SetAccessTokenCookie, SetRefreshTokenCookie} from "./jwt.js";
import { prisma } from "../prisma/database.js";
import { User } from "@prisma/client";
import { GetRandomAvatarPath } from "../users/avatar.js";
import { TwoFactoLoginController } from "./totp.js"

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

async function FetchGithubUserData(res:FastifyReply, OauthToken:string, host:string)
{
	const userFetchRes = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${OauthToken}`,
			'User-Agent': 'SoloSpin'
		}
	})
	if (!userFetchRes.ok)
		return res.redirect(`https://${host}:8443/login?error=${encodeURIComponent(`Failed to fetch user data from github`)}`)
	let githubUserData = await userFetchRes.json() as GitHubUser
	if (!githubUserData.email) {
		const emailFetchRes = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${OauthToken}`,
				'User-Agent': 'SoloSpin'
			}
		})
		if (!emailFetchRes.ok)
			return res.redirect(`https://${host}:8443/login?error=${encodeURIComponent('Failed to fetch user email from github')}`)
		const emailDetails = await emailFetchRes.json() as GitHubEmail[]
		githubUserData.email = emailDetails.find((elm) => elm.primary && elm.verified)?.email || null
		if (!githubUserData.email)
			return res.redirect(`https://${host}:8443/login?error=${encodeURIComponent('No Github verified primary email found')}`)
	}
	return githubUserData
}

async function githubOauthAuthenticate(res:FastifyReply, localUser:User, remoteUser:GitHubUser, host:string)
{
	if (localUser.oauth_provider != "github")
		return res.redirect(`https://${host}:8443/login?error=${encodeURIComponent('email already registered using a different provider')}`)
	else if (localUser.email == remoteUser.email && localUser.oauth_id != remoteUser.id.toString())
		return res.redirect(`https://${host}:8443/login?error=${encodeURIComponent('email already in use')}`)
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
	if (localUser.two_factor_enabled)
		return TwoFactoLoginController(res, host, localUser.id, true)
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
	  return res.redirect(`https://${req.host}:8443/login?error=${encodeURIComponent(error)}`)
	try {
		const tokenResult = await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    	const accessToken = tokenResult.token.access_token;
		const githubUserData = await FetchGithubUserData(res, accessToken, req.host)
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
			await githubOauthAuthenticate(res, user, githubUserData, req.host)
			if (res.sent)
				return
			res.redirect(`https://localhost:8443/home`)
		}
		else { 
			await githubOauthRegistration(res, githubUserData)
			res.redirect(`https://localhost:8443/home`)
		}
	}
	catch (error){
		req.log.error(error)
		res.redirect(`https://${req.host}:8443/login?error=${encodeURIComponent("oauth setup failed")}`)
	}
}
