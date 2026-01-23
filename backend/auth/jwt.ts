import { FastifyRequest, FastifyReply } from "fastify";

export function SetAccessTokenCookie(res: FastifyReply, user_id: number)
{
	const jwtToken = res.server.jwt.sign({sub:user_id}, {expiresIn: "15m"})
	res.cookie("accessToken", jwtToken, {
    	path: '/',
    	httpOnly: true,
    	secure: true,
    	sameSite: 'lax',
    	expires: new Date(Date.now() + (15 * 60 * 1000))
  })
}

export function SetRefreshTokenCookie(res: FastifyReply, user_id :number)
{
	const jwtToken = res.server.jwt.sign({sub:user_id}, {expiresIn: "7d", key:process.env.JWT_REFRESH_SECRET!})
	res.cookie("refreshToken", jwtToken, {
    	path: '/api/refresh',
    	httpOnly: true,
    	secure: true,
    	sameSite: 'lax',
    	expires: new Date(Date.now() + (7 * 24 * 3600 * 1000))
	})
	return jwtToken;
}

export async function twoFactorTokenVerify(req: FastifyRequest, res: FastifyReply)
{
	const token:string | undefined = req.cookies["mfaToken"]

	if (!token)
		return (res.code(400).send({message: "token cookie not found", statusCode: 400}))
	try {
		const decoded = req.server.jwt.verify(token)
		if ((decoded as any).type != "2fa_temp")
			return (res.code(400).send({message: "Invalid token type", statusCode: 400}))
		req.user = decoded
	}
	catch (err){
		res.code(401).send({
			message: "expired token please login again",
			statusCode: 401
		})
	}
}

export async function authVerifier(req: FastifyRequest, res: FastifyReply)
{
	try {
		await req.jwtVerify();
	}
	catch (err){
		res.code(401).send({ 
			message: 'the token is invalid or expired.',
			statusCode: 401
    	});
	}
}
