import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../database.js";
import {app} from "../server.js"
import { SetJwtTokenCookie } from "./jwt.js";
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
	const {username, password} = req.body as {username:string, password:string};
	try {
		const password_hash:string = await bcrypt.hash(password, process.env.SALT_ROUNDS!)
		const user = await prisma.user.findUnique({
			where: {
				username:username,
				password_hash:password_hash
			},
			select:{
				id:true, name: true, username:true,
				email:true, reg_date:true
			}
		})
		if (!user)
			return res.code(401).send({message: "invalid username or password"})
		const jwtToken = app.jwt.sign({sub:user.id}, {expiresIn: '15m'})
		SetJwtTokenCookie(res, jwtToken)
	}
	catch (error){
		req.log.error(error)
		return res.code(500).send({message: "Server unexpected error"})
	}
	return res.code(200).send({ message: "Successfully authenticated." });
}
