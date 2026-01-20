import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"
import fs from "fs";
import { pipeline } from "stream/promises";

export const avatarUploadSchema = {
    headers: {
        type: 'object',
        properties: {
            'content-type': { type: 'string', pattern: '^multipart/form-data' }
        },
        required: ['content-type']
	}
}

export const fetchAvatarSchema = {
	params: {
		type: 'object',
		required: ["id"],
		properties: {
			id: { type: 'integer', minimum: 1}
		},
		additionalProperties: false
	}
}

export function GetRandomAvatarPath():string{
	let default_avatars:string[] = []
	for(let i = 1; i <= 6; i++)
		default_avatars.push(`avatar_${i}.png`)//there are 6 default avatars
	const randomIndex = Math.floor(Math.random() * default_avatars.length);
	const path: string = process.env.AVATARS_STORAGE_PATH! + '/' + default_avatars[randomIndex];	
	console.log(`selected path: ${path}`);
	return path;
}

export async function GetUserAvatar(req: FastifyRequest, res:FastifyReply)
{
	const {id} = req.params as {id:string}
	try {
		const user = await prisma.user.findUnique({
			where: {
				id:parseInt(id)
			},
			select:{
				avatar_path:true
			}
		})
		console.log(user.avatar_path)
		if (!user)
			return res.code(404).send({message: "user not found", statusCode: 404})
		else if (!fs.existsSync(user.avatar_path))
			return res.code(404).send({error: 'Avatar not found', statusCode: 404});
		res.header('Content-type', 'image/png')
		const stream = fs.createReadStream(user!.avatar_path)
		return res.send(stream)
	}
	catch (error){
		req.log.error(error);
		res.code(500).send({message: "Server unexpected error", statusCode: 500})
	}
}

export async function GetLoggedUserAvatar(req: FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub;
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: user_id
			},
			select:{
				avatar_path:true
			}
		})
		if (!user){
			return res.code(401).send({
				message: 'User associated with token not found or account deactivated. Please log in again.',
				statusCode: 401
			})
		}
		else if (!fs.existsSync(user.avatar_path))
			return res.code(404).send({error: 'Avatar not found', statusCode: 404});
		res.header('Content-Type', 'image/png');
		const stream = fs.createReadStream(user.avatar_path);
		return res.send(stream);
	}
	catch (error){
		req.log.error(error);
		res.code(500).send({message: "Server unexpected error", statusCode: 500})
	}
}

export async function updateUserAvatar(req: FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub;
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: user_id
			},
			select:{
				avatar_path:true
			}
		})
		if (!user){
			return res.code(401).send({
				message: 'User associated with token not found or account deactivated. Please log in again.',
				statusCode: 401
			})
		}
		const data = await req.file()
		if (!data) {
			return res.code(400).send({ message: "No file uploaded", statusCode: 400 });
		}
		if (data.mimetype !== 'image/png') {
			data.file.resume()
			return res.code(400).send({ message: "only PNG images are accepted.", statusCode: 400 });
		}
		const avatar_path = `${process.env.AVATARS_STORAGE_PATH}/user_${user_id}_avatar.png`;
		const temp_path = `${process.env.AVATARS_STORAGE_PATH}/tmp_user_${user_id}_avatar.png`;
		const writeStream = fs.createWriteStream(temp_path);
		await pipeline(data.file, writeStream);
		if (data.file.truncated){
			fs.unlinkSync(temp_path)
			return res.code(413).send({message: "File too large. Max 3MB.", statusCode: 413})
		}
		const secondFile = await req.file();
		if (secondFile){//sending more than one element
			console.log("inside")
			fs.unlinkSync(temp_path)
			secondFile.file.resume(); 
			throw { code: 'FST_FILES_LIMIT' }; 
		}
		fs.renameSync(temp_path, avatar_path)//if file exists, it will be overwritten
		await prisma.user.update({
			where:{
				id: user_id
			},
			data:{
				avatar_path: avatar_path
			}
		})
	}
	catch (error:any){
		if (error.code === 'FST_FILES_LIMIT')
			return res.code(400).send({ message: "You can only upload one file at a time.", statusCode: 400 });
		req.log.error(error);
		return res.code(500).send({message: "server unexpected error.", statusCode: 500})
	}
	return  res.code(200).send({ message: "Avatar updated successfully." });
}
