import { FastifyReply, FastifyRequest } from "fastify";
import { updateUserAchievements } from "./achievements.js";
import {prisma} from "../prisma/database.js"

const  xpPerGameWin = 150
const  xpPerGoalDifference = 25 // score '5-0' -> 5 * 25 = 125
export const firstLevelXp = 300
export const xpIncreaseFactor = 1.25

export const storeMatchSchema = {
	body: {
		type: 'object',
		required: ["winner_id", "loser_id", "winner_score", "loser_score"],
		properties: {
			winner_id: {type: 'integer', minimum: 0},
			loser_id: {type: 'integer', minimum: 0},
			winner_score: {type: 'integer', minimum: 1},
			loser_score: {type: 'integer', minimum: 0}
		},
		additionalProperties: false
	}
}

export const gameHistorySchema = {
	querystring: {
		type: 'object',
		required: ["limit"],
		properties: {
			limit: {type: 'integer', minimum: 1},
		},
		additionalProperties: false
	}
}

export const gameLeaderboardSchema = {
	querystring: {
		type: 'object',
		required: ["limit"],
		properties: {
			limit: {type: 'integer', minimum: 1},
		},
		additionalProperties: false
	}
}

async function updateUserStats(winner:any, winner_score:number, loser_score:number, loser:any)
{
	let leveledUp = false
	let requiredLevelUpXp = firstLevelXp * Math.pow(xpIncreaseFactor, winner.level)
	if (winner.level == 0)
		requiredLevelUpXp = firstLevelXp
	// console.log(`level ${user.level} requires ${requiredLevelUpXp} XP`)
	const xpBonus = (winner_score - loser_score) * xpPerGoalDifference
	winner.experience_points += xpPerGameWin + xpBonus
	winner.total_xp_points += xpPerGameWin + xpBonus
	// console.log(`User ${user.id} gained ${xpPerGameWin + xpBonus} XP`)
	if (winner.experience_points > requiredLevelUpXp) {
		winner.level++
		leveledUp = true
		winner.experience_points -= requiredLevelUpXp
		// console.log(`User ${user.id} leveled up to level ${user.level}`)
		// console.log(` current xp :${user.experience_points}`)
	}
	updateUserAchievements(winner, leveledUp, loser, winner_score, loser_score)
	await prisma.user.update({
		where:{
			id:winner.id
		},
		data :{
			level: winner.level, 
			experience_points: winner.experience_points,
			total_xp_points: winner.total_xp_points,
			goals_scored: {increment: winner_score},
			goals_conceded: {increment: loser_score},
			games_won: {increment: 1},
			achievement_string: winner.achievement_string
		}
	})
	await prisma.user.update({
		where:{
			id:loser.id
		},
		data:{
			goals_conceded: {increment: winner_score},
			goals_scored: {increment: loser_score},
			games_lost: {increment: 1},
			achievement_string: loser.achievement_string
		}
	})
}

export async function storeMatchResult(req:FastifyRequest, res:FastifyReply)
{
	const {winner_id, loser_id, winner_score, loser_score} = req.body as
		{winner_id:number, loser_id:number, winner_score:number, loser_score:number} 
	if (winner_score <= loser_score)
		return res.code(400).send({message: "winner score must be greater than loser score", statusCode: 400})
	else if (winner_id == loser_id)
		return res.code(400).send({message: "winner id and loser id must be different", statusCode: 400})
	try {
		const game = await prisma.game.create({
			data:{
				score:`${winner_score}-${loser_score}`,
				winner_id: winner_id,
				loser_id: loser_id
			},
			include:{
				winner: {
					select: {
						id:true,
						level: true,
						experience_points: true,
						total_xp_points: true,
						games_won: true,
						games_lost: true,
						goals_scored: true,
						achievement_string: true
					}
				},
				loser: {
					select: {
						id:true,
						games_won: true,
						games_lost: true,
						goals_scored: true,
						achievement_string: true
					}
				}
			}
		})
		await updateUserStats(game.winner, winner_score , loser_score, game.loser)
	}
	catch (error:any) {
		if (error.code === 'P2003'){
			const field = error.meta?.field_name?.[0] || 'unknown';
			const userId = field.includes('winner') ? winner_id : loser_id;
			return res.code(404).send({ message: `User with id ${userId} does not exist`, statusCode: 404});
		}
		return res.code(500).send({message: "Server unexpected error", statusCode: 500})
	}
	return res.code(201).send({msg: "game stored successfully"})
}

export async function getGameHistory(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	const {limit} = req.query as {limit:number}
	try {
		const games = await prisma.game.findMany({
			where:{
				OR:[
					{loser_id: user_id},
					{winner_id: user_id}
				]
			},
			select:{
				loser:{
					select:{
						id:true, 
						username: true
					}
				},
				winner:{
					select:{
						id:true,
						username: true
					}
				},
				score: true
			},
			orderBy:{
				match_date:'desc'
			},
			take: limit
		})
		return res.code(200).send(games)
	}
	catch (error){
		return res.code(500).send({message: "Server unexpected Error", statusCode: 401})
	}
}

export async function getLeaderboard(req:FastifyRequest, res:FastifyReply)
{
	const {limit} = req.query as {limit:number}
	try {
		const top_users = await prisma.user.findMany({
			select:{
				id:true,
				username:true,
				total_xp_points: true,
			},
			orderBy:{
				total_xp_points: 'desc'
			},
			take: limit
		})
		return res.code(200).send(top_users)
	}
	catch (error){
		return res.code(500).send({message: "Server unexpected Error", statusCode: 401})
	}
}
