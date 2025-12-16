import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../database";
import { SetAccessTokenCookie, SetRefreshTokenCookie } from "./jwt";

export async function refresh(req:FastifyRequest, res:FastifyReply)
{
	try{
		await req.refreshJwtVerify()
		const user_id = (req.user as any).sub
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
