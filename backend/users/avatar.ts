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

let num = 0;

export function GetRandomAvatarPath():string{
    let image_names = ["avatar1.png", "avatar2.png", "avatar3.png"]
    const path:string = process.env.AVATARS_STORAGE_PATH! + image_names[num];
	console.log(`selected index: ${num}`);
	num++;
	if (num >= 3)
		num = 0;
	console.log(`index after: ${num}`);
	return path;
}

export async function GetLoggedUserAvatar(req: FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub;
	const user = await prisma.user.findFirst({
		where: {
			id: user_id
		},
		select:{
			avatar_path:true
		}
	})
	if (!user){
		return res.code(401).send({
			message: 'User associated with token not found or account deactivated. Please log in again.'
		})
	}
	if (!fs.existsSync(user.avatar_path)) {
    return res.code(404).send({ error: 'Avatar not found' });
  }

  res.header('Content-Type', 'image/png');
  const stream = fs.createReadStream(user.avatar_path);
  return res.send(stream);
}

export async function updateUserAvatar(req: FastifyRequest, res:FastifyReply)
{
	const user_id = (req.user as any).sub;
	try {
		const user = await prisma.user.findFirst({
			where: {
				id: user_id
			},
			select:{
				avatar_path:true
			}
		})
		if (!user){
			return res.code(401).send({
				message: 'User associated with token not found or account deactivated. Please log in again.'
			})
		}
		const data = await req.file();
		if (!data) {
			return res.code(400).send({ message: "No file uploaded" });
		}
		if (data.mimetype !== 'image/png') {
    	    return res.code(400).send({ message: "only PNG images are accepted." });
    	}
		const avatar_path = `${process.env.AVATARS_STORAGE_PATH}user_${user_id}_avatar.png`;
		const writeStream = fs.createWriteStream(avatar_path);//if file exists, it will be overwritten
		await pipeline(data.file, writeStream);

		await prisma.user.update({
			where:{
				id: user_id
			},
			data:{
				avatar_path: avatar_path
			}
		})
	}
	catch (error){
		req.log.error(error);
		return res.code(500).send({message: "server unexpected error."})
	}
	return  res.code(200).send({ message: "Avatar updated successfully." });
}
