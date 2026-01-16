import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"
import { firstLevelXp , xpIncreaseFactor} from "./games.js"
import {decodeUserAchievementString} from './achievements.js'

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

function cleanUserObject(user:any)
{
	return ({
		id: user.id,
		name: user.name, username: user.username,
		email: user.email,
		level: user.level,
		games_lost: user.games_lost, 
		games_won: user.games_won,
		score: user.total_xp_points,
	})
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
				total_xp_points:true,
				achievement_string: true,
			}
		})
		if (!user){
			return res.code(401).send({
				message: 'User associated with token not found or account deactivated. Please log in again.',
				statusCode: 401
			})
		}
		const achievements = decodeUserAchievementString(user.achievement_string!)
		let levelProgress = getLevelProgressPercentage(user.level, user.experience_points)
		return res.code(200).send({user:cleanUserObject(user), levelProgress, achievements});
	}
	catch (err){
		req.log.error(err);
		return res.code(500).send({message:"Server unexpected error", statusCode: 500})
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
				experience_points: true, 
				achievement_string: true
			}
		})
		if (!user)
			return res.code(404).send({message: `no user found with id: ${id}`, statusCode: 404})
		const achievements = decodeUserAchievementString(user.achievement_string!)
		let levelProgress = getLevelProgressPercentage(user.level, user.experience_points)
		const clean_user = {
			username: user.username,
			name: user.name,
			score: user.total_xp_points,
			level: user.level,
		}
		return res.code(200).send({user:clean_user, levelProgress, achievements})

	}
	catch (error){
		req.log.error(error);
		return res.code(500).send({message:"Server unexpected error", statusCode: 500})
	}
}

export async function personalInfos(req:FastifyRequest, res:FastifyReply)// route "/api/personal-info"
{
	try {
		const user_id = (req.user as any).sub;
		const user = await prisma.user.findUnique({
			where:{
				id: user_id
			},
			select:{
				name: true, username: true,
				email:true,
			}
		})
		if (!user){
			return res.code(401).send({
				message: 'User associated with token not found or account deactivated. Please log in again.',
				statusCode: 401
			})
		}
		return res.code(200).send(user);
	}
	catch (err){
		console.log(err)
		return res.code(500).send({message:"Server unexpected error", statusCode: 500})
	}
}
