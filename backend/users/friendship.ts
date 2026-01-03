import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"

// POST,/api/friends/request,Send a new friend request (requires receiverId)
// GET,/api/friends/requests,List all PENDING requests for the logged-in user
// GET,/api/user/friends,List all logged in user friends
// POST,/api/friends/accept,Update a request status to ACCEPTED (requires requestId)
// POST,/api/friends/reject,Remove a request (requires requestId)
// DELETE,/api/friends/:id,Remove an existing friend (Unfriend)

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
			id: { type: 'integer', pattern: '^[0-9]+$'}//all digits
		},
		additionalProperties: false
	}
}

async function checkRequestDuplicateRequest(res:FastifyReply, sender_id:number, receiver_id: number)
{
	console.log(`looking for a request where\nsender_id = ${receiver_id}, receiver_id = ${sender_id}`)
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
			return res.code(400).send({message: "the user is already in your friends list"})
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
		return res.code(400).send({message: "You cannot send a friend request to yourself."});
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
		if (error.code === 'P2002')
	        return res.code(409).send({ message: "Request already exists" });
	    else if (error.code === 'P2003')
	        return res.code(404).send({ message: "The target user does not exist" });
		else 
			return res.code(500).send({message: "Server unexpected Error"})
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
	catch{
		return res.code(500).send({msg: "Server unexpected Error"})
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
    		    friendshipId: friendship.id
    		};
		});
    	return res.send(formattedFriends);
	}	
	catch{
		return res.code(500).send({msg: "Server unexpected Error"})
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
			return res.code(404).send({ message: "Friend request not found" });
		else if (request.receiverId !== user_id)
			return res.code(403).send({ message: "You are not authorized to reject this request" });
		else if (request.status === 'ACCEPTED')
			return res.code(400).send({ message: "request already accepted" });
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
		 return res.code(500).send({message: "Server unexpected Error"})
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
			return res.code(404).send({ message: "Friend request not found" });
		else if (request.receiverId !== user_id)
			return res.code(403).send({ message: "You are not authorized to reject this request" });
		else if (request.status !== 'PENDING')
			return res.code(400).send({ message: "Only pending requests can be rejected" });
		await prisma.friendship.delete({
			where: { id: request_id }
		});
		
		return res.code(200).send({ message: "Request rejected successfully" });
	}
	catch (error: any) {
		return res.code(500).send({ message: "Server unexpected Error" });
	}
}

export async function removeFriendship(req:FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub
	const { id } = req.params as { id: string };
	const friend_id = parseInt(id)

	try {
		const relation = await prisma.friendship.findFirst({
			where: {
				AND: [
					{
						OR: [
							{ senderId: user_id, receiverId: friend_id },
							{ senderId: friend_id, receiverId: user_id }
						]
					},
					{ status: 'ACCEPTED' }
				]
			}
		});
		if (!relation)
			return res.code(404).send({ message: "Friend relation not found" });
		await prisma.friendship.delete({
			where: { id: relation.id }
		});
	}
	catch (error) {
		return res.code(500).send({ message: "Server unexpected Error" });
	}
	return res.code(200).send({ message: "Friend removed successfully" });
}
