import { FastifyRequest, FastifyReply } from "fastify";

export function SetAccessTokenCookie(res: FastifyReply, user_id: number)
{
	const jwtToken = res.server.jwt.sign({sub:user_id}, {expiresIn: "15m"})
	res.cookie("accessToken", jwtToken, {
    	domain: 'localhost',
    	path: '/',
    	httpOnly: true,
    	secure: false, //to allow http CHANGE IT TO true IN PROD (https only)
    	sameSite: 'strict',
    	expires: new Date(Date.now() + (15 * 60 * 1000))
  })
}

export function SetRefreshTokenCookie(res: FastifyReply, user_id :number)
{
	const jwtToken = res.server.jwt.sign({sub:user_id}, {expiresIn: "7d", key:process.env.JWT_REFRESH_SECRET!})
	res.cookie("refreshToken", jwtToken, {
		domain: 'localhost',
    	path: '/api/refresh',
    	httpOnly: true,
    	secure: false, //to allow http CHANGE IT TO true IN PROD (https only)
    	sameSite: 'strict',
    	expires: new Date(Date.now() + (7 * 24 * 3600 * 1000))
	})
	return jwtToken;
}

export async function authVerifier(req: FastifyRequest, res: FastifyReply)
{
	try {
		await req.jwtVerify();
	}
	catch (err){
		res.code(401).send({ 
		message: 'the token is invalid or expired.',
		error: err 
    });
	}
}
