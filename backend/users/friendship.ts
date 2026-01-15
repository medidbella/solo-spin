import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"

export const friendRequestSchema = {
	body: {
		type: 'object',
		required: ["receiver_id"],
		properties: {
			receiver_id: { type: 'integer', minimum: 1 }
		},
		additionalProperties: false
	}
}

export const friendRequestActionSchema = {
	body: {
		type: 'object',
		required: ["request_id"],
		properties: {
			request_id: { type: 'integer', minimum: 1 }
		},
		additionalProperties: false
	}
}

export const unfriendSchema = {
	params: {
		type: 'object',
		required: ["id"],
		properties: {
			id: { type: 'integer', minimum: 1}
		},
		additionalProperties: false
	}
}

export const friendBlockSchema = {
	body: {
		type: 'object',
		required: ["friend_id"],
		properties: {
			friend_id: { type: 'integer', minimum: 1 }
		},
		additionalProperties: false
	}
}

export async function getRelation(user_id1:number, user_id2:number)
{
	const relation = await prisma.friendship.findFirst({
			where: {
				AND: [
					{
						OR: [
							{ senderId: user_id1, receiverId: user_id2 },
							{ senderId: user_id2, receiverId: user_id1 }
						]
					},
					{ status: 'ACCEPTED' }
				]
			},
			select:{
				blockerId:true,
				id: true
			}
		});
	return relation
}

async function checkRequestDuplicateRequest(res:FastifyReply, sender_id:number, receiver_id: number)
{
	const request = await prisma.friendship.findFirst({
		where:{
			senderId: receiver_id,
			receiverId: sender_id
		},
		select:{
			status: true
		}
	})
	if (request){
		if (request.status == 'ACCEPTED')
			return res.code(400).send({message: "the user is already in your friends list", StatusCode: 400})
		await prisma.friendship.update({
			where:{
				senderId_receiverId: {
					senderId: receiver_id,
					receiverId: sender_id
				}
			},
			data:{
				status: 'ACCEPTED'
			}
		})
		res.code(200).send({message: "the user is now your friend"})
	}
}

export async function sendFriendRequest(req:FastifyRequest, res:FastifyReply)
{
	const sender_id = (req.user as any).sub;
	const {receiver_id} = req.body as {receiver_id: number};
	if (sender_id === receiver_id){
		return res.code(400).send({message: "You cannot send a friend request to yourself.", statusCode: 400});
	}
	try {
		await checkRequestDuplicateRequest(res, sender_id, receiver_id)
		if (res.sent)
			return
		await prisma.friendship.create({
			data:{
				senderId: sender_id,
				receiverId: receiver_id
			}
		})
	}
	catch (error: any)
	{
		req.log.error(error);
		if (error.code === 'P2002')
			return res.code(409).send({ message: "Request already exists", statusCode: 409 });
		else if (error.code === 'P2003')
			return res.code(404).send({ message: "The target user does not exist", statusCode: 404 });
		else 
			return res.code(500).send({message: "Server unexpected Error", statusCode: 500})
	}
	return res.code(201).send({msg: "request sent successfully"})
}

export async function listFriendRequests(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	try { 
		const pendingRequests = await prisma.friendship.findMany({
        where: {
            receiverId: user_id,
            status: 'PENDING'
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    	});
    	return res.send(pendingRequests);
	}	
	catch(error){
		req.log.error(error);
		return res.code(500).send({message: "Server unexpected Error", statusCode: 500})
	}
}

export async function listFriends(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	try { 
		let user_friends = await prisma.friendship.findMany({
			where: {
				OR: [
					{ senderId: user_id },
					{ receiverId: user_id }
				],
				status: 'ACCEPTED'
			},
			include: {
				sender: {
					select: {id: true, username: true, name: true}
				},
				receiver: {
					select: {id: true, username: true, name: true}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
		const formattedFriends = user_friends.map(friendship => {
    		const friend = friendship.sender.id === user_id 
    		    ? friendship.receiver 
    		    : friendship.sender;
    		return {
    		    id: friend.id,
    		    username: friend.username,
    		    name: friend.name,
    		    friendshipId: friendship.id,
				blockedBy: friendship.blockerId
    		};
		});
    	return res.send(formattedFriends);
	}	
	catch (error){
		req.log.error(error);
		return res.code(500).send({message: "Server unexpected Error", statusCode: 500})
	}
}

export async function acceptRequest(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	const {request_id} = req.body as {request_id: number}

	try {
		const request = await prisma.friendship.findUnique({
			where: { id: request_id }
		});
		if (!request)
			return res.code(404).send({ message: "Friend request not found", statusCode: 404 });
		else if (request.receiverId !== user_id)
			return res.code(403).send({ message: "You are not authorized to reject this request", statusCode: 403 });
		else if (request.status === 'ACCEPTED')
			return res.code(400).send({ message: "request already accepted", statusCode: 400 });
		await prisma.friendship.update({
			where:{
				id:request_id
			}, 
			data:{
				status: 'ACCEPTED'
			}
		})
	}
	catch (error:any){
		req.log.error(error);
		return res.code(500).send({message: "Server unexpected Error", statusCode: 500})
	}
	return res.code(200).send({msg: "Request accepted successfully"})
}

export async function rejectRequest(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	const {request_id} = req.body as {request_id: number}

	try {
		const request = await prisma.friendship.findUnique({
			where: { id: request_id }
		});
		if (!request)
			return res.code(404).send({ message: "Friend request not found", statusCode: 404 });
		else if (request.receiverId !== user_id)
			return res.code(403).send({ message: "You are not authorized to reject this request", statusCode: 403 });
		else if (request.status !== 'PENDING')
			return res.code(400).send({ message: "Only pending requests can be rejected", statusCode: 400 });
		await prisma.friendship.delete({
			where: { id: request_id }
		});
        
		return res.code(200).send({ message: "Request rejected successfully" });
	}
	catch (error: any) {
		req.log.error(error);
		return res.code(500).send({ message: "Server unexpected Error", statusCode: 500 });
	}
}

export async function removeFriendship(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	const { id } = req.params as { id: string };
	const friend_id = parseInt(id)

	try {
		const relation = await getRelation(user_id, friend_id)
		if (!relation)
			return res.code(404).send({ message: "Friend relation not found", StatusCode: 404 });
		await prisma.friendship.delete({
			where: { id: relation.id }
		});
	}
	catch (error) {
		return res.code(500).send({ message: "Server unexpected Error", StatusCode: 500});
	}
	return res.code(200).send({ message: "Friend removed successfully" });
}

export async function blockFriend(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	const { friend_id } = req.body as { friend_id: number };
	try {
		const relation = await getRelation(user_id, friend_id)
		if (!relation)
			return res.code(404).send({ message: "Friend relation not found", StatusCode: 404});	
		if (relation.blockerId == user_id)
			return res.code(400).send({message: "User has already been blocked", StatusCode: 400})
		else if (relation.blockerId == friend_id)
			return res.code(400).send({message: "User has already blocked you", StatusCode: 400})
		await prisma.friendship.update({
			where:{
				id: relation.id
			},
			data:{
				blockerId: user_id
			}
		})
	}
	catch (error) {
		return res.code(500).send({ message: "Server unexpected Error", StatusCode: 500});
	}
	return res.code(200).send({message: "Blocked the user successfully"})
}

export async function unBlockFriend(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	const { friend_id } = req.body as { friend_id: number };
	try {
		const relation = await getRelation(user_id, friend_id)
		if (!relation)
			return res.code(404).send({ message: "Friend relation not found", StatusCode: 404});
		else if (!relation.blockerId)
			return res.code(400).send({ message: "User is not blocked", StatusCode: 400});
		else if (relation.blockerId == friend_id)
			return res.code(403).send({message: "You cannot unblock a user who has blocked you", StatusCode: 403})
		await prisma.friendship.update({
			where:{
				id: relation.id
			},
			data:{
				blockerId: null
			}
		})
	}
	catch (error) {
		return res.code(500).send({ message: "Server unexpected Error", StatusCode: 500});
	}
	return res.code(200).send({message: "user unblocked successfully"})
}
