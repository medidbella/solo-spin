import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"

export async function me(req:FastifyRequest, res:FastifyReply)
{
	try {
		const user_id = (req.user as any).sub;
		const user = await prisma.user.findUnique({
			where:{
				id: user_id
			},
			select:{
				id: true,
				name: true, username: true,
				email:true, reg_date:true,
				experience_points:true, 
				level: true,
				games_lost: true, 
				games_won: true
			}
		})
		if (!user){
			return res.code(401).send({
				message: 'User associated with token not found or account deactivated. Please log in again.'
			})
		}
		return res.code(200).send({ message: "Successfully fetched user data.", user});
	}
	catch (err){
		return res.code(500).send({
			message:"Server unexpected error"
		})
	}
}
