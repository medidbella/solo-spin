import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma/database.js";
import { SetAccessTokenCookie, SetRefreshTokenCookie } from "./jwt.js";

function verifyRefreshToken(req:FastifyRequest):number
{
	const token = req.cookies.refreshToken
	if (!token)
		throw new Error("refreshToken not found")
	const decoded = req.server.jwt.verify(token, {key: process.env.JWT_REFRESH_SECRET!});
	// console.log("JWT refresh token is verified successfully")
	return parseInt((decoded as any).sub)
}

export async function refresh(req:FastifyRequest, res:FastifyReply)
{
	try {
		const user_id = verifyRefreshToken(req)
		const user = await prisma.user.findUnique({
			where:{
				id: user_id
			},
			select: {
				id: true,
				refresh_token: true
			}
		})
		// console.log(`${user?.refresh_token}`)
		// console.log(`${req.cookies.refreshToken}`)
		if (!user || !user.refresh_token || req.cookies.refreshToken != user.refresh_token)
			return res.code(401).send({message: "Invalid refresh token", statusCode: 401})
		SetAccessTokenCookie(res, user_id)
		const token = SetRefreshTokenCookie(res, user.id)
		await prisma.user.update({
			where: {
				id:user_id
			},
			data:{
				refresh_token: token
			}
		})
	}
	catch (error){
		return res.code(401).send({message: "Refresh failed", statusCode: 401})
	}
	return res.code(200).send({message: "Tokens refreshed successfully"})
}
