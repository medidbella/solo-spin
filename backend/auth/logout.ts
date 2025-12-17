import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../database.js";

export async function logout(req: FastifyRequest, res: FastifyReply)
{
	res.clearCookie('accessToken', {path: "/"})
	res.clearCookie('refreshToken', {path: "/refresh"})

	try {
		await req.jwtVerify({key:process.env.JWT_ACCESS_SECRET!})
		const user = await prisma.user.update({
			where: {
				id : (req.user as any).sub
			},
			data: {
				refresh_token:null
			}
		});
	}
	catch (error) {
	 	res.log.info("user logged out with an invalid token")}
	return res.code(200).send({message: "Logged out successfully"})
}