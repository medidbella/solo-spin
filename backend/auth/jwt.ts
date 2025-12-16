import { FastifyRequest, FastifyReply } from "fastify";
import { app } from "../server.js";

export function SetAccessTokenCookie(res: FastifyReply, user_id: number)
{
	const jwtToken = app.access.sign({sub:user_id}, {expiresIn: "15m"})
	res.cookie("accessToken", jwtToken, {
    	domain: 'localhost',
    	path: '/',
    	httpOnly: true,
    	secure: false, //to allow http CHANGE IT TO true IN PROD (https only)
    	sameSite: 'strict',
    	expires: new Date(Date.now() + (15 * 60 * 1000))
  })
}

export function SetRefreshTokenCookie(res: FastifyReply, user: {refresh_token :string | null, id :number})
{
	const jwtToken = app.refresh.sign({sub:user.id}, {expiresIn: "7d"})
	res.cookie("refreshToken", jwtToken, {
		domain: 'localhost',
    	path: '/refresh',
    	httpOnly: true,
    	secure: false, //to allow http CHANGE IT TO true IN PROD (https only)
    	sameSite: 'strict',
    	expires: new Date(Date.now() + (7 * 24 * 3600 * 1000))
	})
	user.refresh_token = jwtToken
}

export async function authVerifier(req: FastifyRequest, res: FastifyReply)
{
	try {
		await req.accessJwtVerify();
	}
	catch (err){
		res.code(401).send({ 
		message: 'the token is invalid or expired.' 
    });
	}
}
