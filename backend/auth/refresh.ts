import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../database.js";
import { SetAccessTokenCookie, SetRefreshTokenCookie } from "./jwt.js";

function verifyRefreshToken(req:FastifyRequest):number
{
	const token = req.cookies.refresh_token
	if (!token)
		throw new Error("refreshToken not found")
	const decoded = req.server.jwt.verify(token, {key: process.env.JWT_REFRESH_SECRET! });
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
		if (!user || !user.refresh_token || req.cookies.refresh_token != user.refresh_token)
			return res.code(401).send({message: "Invalid refresh token"})
		SetAccessTokenCookie(res, user_id)
		SetRefreshTokenCookie(res, user)
		prisma.user.update({
			where: {
				id:user_id
			},
			data:{
				refresh_token: user.refresh_token
			}
		})
	}
	catch (error){
		return res.code(401).send({message: "Refresh failed"})
	}
	return res.code(200).send({message: "Tokens refreshed successfully"})
}
