import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"

const xpPerGameWin = 100
const firsLevelXp = 300
const xpPerGoalDifference = 25 // score '5-0' -> 5 * 25 = 125
const xpIncreaseFactor = 1.25

export const storeGameSchema = {
	body: {
		type: 'object',
		required: ["winner_id", "loser_id", "winner_score", "loser_score"],
		properties: {
			winner_id: {type: 'integer', minimum: 1},
			loser_id: {type: 'integer', minimum: 1},
			winner_score: {type: 'integer', minimum: 1},
			loser_score: {type: 'integer', minimum: 0}
		},
		additionalProperties: false
	}
}

async function updateUserStats(user:any, goalDifference:number, loser_id:number)
{
	let requiredLevelUpXp = firsLevelXp * (Math.pow(xpIncreaseFactor, (user.level)) - 1) / 0.25
	if (user.level == 0)
		requiredLevelUpXp = firsLevelXp
	console.log(`level ${user.level} requires ${requiredLevelUpXp} XP`)
	const xpBonus = goalDifference * xpPerGoalDifference
	user.experience_points += xpPerGameWin + xpBonus
	console.log(`User ${user.id} gained ${xpPerGameWin + xpBonus} XP`)
	if (user.experience_points > requiredLevelUpXp) {
		user.level++
		user.experience_points = user.experience_points % requiredLevelUpXp
		console.log(`User ${user.id} leveled up to level ${user.level}`)
		console.log(` current xp :${user.experience_points}`)
	}
	await prisma.user.update({
		where:{
			id:user.id
		},
		data :{
			level: user.level, 
			experience_points: user.experience_points,
			games_won: {
				increment: 1
			}
		}
	})
	await prisma.user.update({
		where:{
			id:loser_id
		},
		data:{
			games_lost: {
				increment: 1
			}
		}
	})
}

export async function storeGameResult(req:FastifyRequest, res:FastifyReply)
{
	const {winner_id, loser_id, winner_score, loser_score} = req.body as
		{winner_id:number, loser_id:number, winner_score:number, loser_score:number} 
	if (winner_score <= loser_score)
		return res.code(400).send({msg: "winner score must be greater than loser score"})
	else if (winner_id == loser_id)
		return res.code(400).send({msg: "winner id and loser id must be different"})
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
					}
				}
			}
		})
		await updateUserStats(game.winner, winner_score - loser_score, loser_id)
	}
	catch (error:any) {
		if (error.code === 'P2003'){
			const field = error.meta?.field_name?.[0] || 'unknown';
			const userId = field.includes('winner') ? winner_id : loser_id;
			return res.code(404).send({ message: `User with id ${userId} does not exist` });
		}
		return res.code(500).send({msg: "Server unexpected error"})
	}
	return res.code(201).send({msg: "game stored successfully"})
}

