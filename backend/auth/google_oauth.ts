import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { SetAccessTokenCookie, SetRefreshTokenCookie} from "./jwt.js";
import { prisma } from "../prisma/database.js";
import { User } from "@prisma/client";
import { GetRandomAvatarPath } from "../users/avatar.js";

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: {
      generateAuthorizationUri: (req: FastifyRequest, res: FastifyReply) => string;
      getAccessTokenFromAuthorizationCodeFlow: (req: FastifyRequest) => Promise<any>;
    };
  }
}

interface GoogleUser {
  iss: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string; 
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

export async function googleOauthLogin(req:FastifyRequest, res:FastifyReply)
{
	let googleUrl = await req.server.googleOAuth2.generateAuthorizationUri(req, res);
	// console.log(`generated url: ${googleUrl}`)
	return res.redirect(googleUrl);
}

async function googleOauthAuthenticate(res:FastifyReply, localUser:User, remoteUser:GoogleUser, host:string)
{
	if (localUser.oauth_provider != "google")
		return res.redirect(`https://${host}:8443/login?error=${encodeURIComponent('email already registered using a different provider')}`)
	else if (localUser.email == remoteUser.email && localUser.oauth_id != remoteUser.sub)
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

async function googleOauthRegistration(res:FastifyReply, remoteUser:GoogleUser)
{
	const user = await prisma.user.create({
		data:{
			username: remoteUser.name,
			name: remoteUser.given_name ,
			email: remoteUser.email!,
			oauth_id: remoteUser.sub,
			oauth_provider: 'google',
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

export async function googleOauthRedirectHandler(this:FastifyInstance, req:FastifyRequest, res:FastifyReply)
{
	const { code, state, error } = req.query as { code: string, state: string, error?: string };
	if (error)
	  return res.redirect(`https://${req.host}:8443/login?error=${encodeURIComponent(error)}`)
	try {
		const tokenResult = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    	const idToken = tokenResult.token.id_token;
		const googleUserData = req.server.jwt.decode(idToken) as GoogleUser
		// console.log(googleUserData)
		if (!googleUserData.email_verified)
	  return res.redirect(`https://${req.host}:8443/login?error=${encodeURIComponent("google user email is unverified")}`)
		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{oauth_id : googleUserData.sub},
					{email: googleUserData.email!}
				]
			},
		})
		if (user){
			googleOauthAuthenticate(res, user, googleUserData, req.host)
			if (res.sent)
				return
			res.redirect(`https://localhost:8443/home`)
		}
		else {
			googleOauthRegistration(res, googleUserData)
			res.redirect(`https://localhost:8443/home`)
		}
	}
	catch (error){
		req.log.error(error)
		res.redirect(`https://${req.host}:8443/login?error=${encodeURIComponent("oauth setup failed")}`)
	}
}
