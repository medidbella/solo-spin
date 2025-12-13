import { FastifyRequest, FastifyReply } from "fastify";

export function SetJwtTokenCookie(res:FastifyReply, token:string)
{
	res.cookie("accessToken", token, {
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false, //to allow http CHANGE IT TO true IN PROD (https only)
    sameSite: 'strict',
    expires: new Date(Date.now() + (15 * 60 * 1000))
  })
}

export async function authVerifier(req:FastifyRequest, res:FastifyReply)
{
	try {
		await req.jwtVerify();
	}
	catch (err){
		res.code(401).send({ 
		message: 'the token is invalid or expired.' 
    });
	}
}
