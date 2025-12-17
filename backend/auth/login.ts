import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../database.js";
import { SetAccessTokenCookie, SetRefreshTokenCookie} from "./jwt.js";
import bcrypt from "bcrypt";


export const loginSchema = {
	body: {
		type: "object",
		required: ["username", "password"],
		properties: {
			username: { type: "string", minLength: 4 },
			password: { type: "string", minLength: 8 }
		},
		additionalProperties: false
	}
}

export async function login(req:FastifyRequest, res:FastifyReply)
{
	const {username, password} = req.body as {username: string, password: string};
	try {
		const user = await prisma.user.findUnique({
			where: {
				username:username,
			},
			select:{
				id:true, name: true, username:true,
				email:true, reg_date:true,
				refresh_token:true, password_hash:true
			}
		})
		if (!user || !bcrypt.compare(password, user.password_hash))
			return res.code(401).send({message: "invalid username or password"})
		SetAccessTokenCookie(res, user.id)
		SetRefreshTokenCookie(res, {refresh_token: user.refresh_token, id: user.id})
		prisma.user.update({
			where: {
				id:user.id
			},
			data:{
				refresh_token:user.refresh_token
			}
		})
	}
	catch (error){
		req.log.error(error)
		return res.code(500).send({message: "Server unexpected error"})
	}
	return res.code(200).send({ message: "Successfully authenticated." });
}
