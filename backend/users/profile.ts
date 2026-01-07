import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"
import { firstLevelXp , xpIncreaseFactor} from "./games.js"

export const fetchUserDataSchema = {
	params:{
		type: 'object',
		required: ["id"],
		properties: {
			id: { type: 'integer', minimum: 1}
		},
		additionalProperties: false
	}
}

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
				games_won: true,
				goals_scored:true,
				goals_conceded:true,
				total_xp_points:true
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
		return res.code(500).send({message:"Server unexpected error"})
	}
}

function getLevelProgressPercentage(level:number, xp:number):number
{
	let requiredLevelUpXp = firstLevelXp * Math.pow(xpIncreaseFactor, level)
	let result = xp / requiredLevelUpXp * 100
	result = Math.round(result * 100) / 100;
	return result
}

export async function getUserProfile(req:FastifyRequest, res:FastifyReply)
{
	const { id } = req.params as { id: string };
	try {
		const user = await prisma.user.findFirst({
			where:{
				id: parseInt(id)
			},
			select:{
				username: true,
				name: true,
				total_xp_points: true,
				level: true,
				experience_points: true
			}
		})
		if (!user)
			return res.code(404).send({message: `no user found with id: ${id}`})
		let levelProgress = getLevelProgressPercentage(user.level, user.experience_points)
		return res.code(200).send({user, levelProgress})

	}
	catch (error){
		return res.code(500).send({message:"Server unexpected error"})
	}
}
