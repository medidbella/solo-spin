import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"
import {getRelation} from "./friendship.js"

export const storeMessageSchema = {
	body: {
		type: 'object',
		required: ["sender_id", "receiver_id", "content"],
		properties: {
			sender_id: {type: 'integer', minimum: 1},
			receiver_id: {type: 'integer', minimum: 1},
			content: {type: 'string', minLength : 1, maxLength: 2000}
		},
		additionalProperties: false
	}
}

export const listMessagesSchema = {
	querystring : {
		type: 'object',
		required: ["user1_id", "user2_id"],
		properties: {
			user1_id: {type: 'integer', minimum: 1},
			user2_id: {type: 'integer', minimum: 1}
		}
	}
}

export const markConversationSeenSchema = {
	body: {
		type: 'object',
		required: ["user_id", "peer_id"],
		properties: {
			user_id: {type: 'integer', minimum: 1},
			peer_id: {type: 'integer', minimum: 1}
		},
		additionalProperties: false
	}
}

export async function storeMessage(req:FastifyRequest, res:FastifyReply)
{
	const {sender_id, receiver_id, content} = req.body as
		{sender_id:number, receiver_id:number, content:string}
	try {
		const relation = await getRelation(sender_id, receiver_id)
		if (!relation) {
			return res.code(403).send({
				message: "cannot send messages to users who are not in your friends list",
				statusCode: 403
			});
		}
		else if (relation.blockerId == sender_id){
			return res.code(400).send({
				message: "cannot send messages to a user that you blocked",
				statusCode: 400
			});
		}
		else if (relation.blockerId == receiver_id){
			return res.code(400).send({
				message: "cannot send messages to a user that blocked you",
				statusCode: 400
			});
		}
		await prisma.directMessage.create({
			data:{
				content: content,
				friendshipId: relation.id,
				receiverId: receiver_id,
				senderId: sender_id
			}
		})
		return res.code(200).send({message: "message stored successfully"})	
	}
	catch (error){
		req.log.error(error);
		return res.code(500).send({message: "Server unexpected Error", statusCode: 500})
	}
}

export async function listMessages(req:FastifyRequest, res:FastifyReply)
{
	const {user1_id, user2_id} = req.query as any
	try {
		const relation = await getRelation(user1_id, user2_id)
		if (!relation){
			return res.code(404).send({message: "No conversation found between these users", StatusCode: 404})
		}
		const messages = await prisma.directMessage.findMany({
			where:{
				friendshipId: relation.id
			}
		})
		return res.code(200).send(messages)
	}
	catch (error){
		return res.code(500).send({ message: "Server unexpected Error", StatusCode: 500});
	}
}

export async function markConversationSeen(req:FastifyRequest, res:FastifyReply)
{
	const {user_id, peer_id} = req.body as {user_id:number, peer_id:number}
	try {
		const relation = await getRelation(user_id, peer_id)
		console.log(relation)
		if (!relation){
			console.log("no relation")
			return res.code(404).send({message: "No conversation found between the two users", StatusCode: 404})
		}
		await prisma.directMessage.updateMany({
			where:{
				friendshipId: relation.id
			},
			data: {
				isRead:true
			}
		});
		return res.code(200).send({message: "All conversation messages are marked as seen"})
	}
	catch (error){
		return res.code(500).send({message: "Server unexpected Error", StatusCode: 500})
	}
}
