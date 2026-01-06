import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"
import bcrypt from "bcrypt";
import { SetAccessTokenCookie, SetRefreshTokenCookie} from "./jwt.js";
import {GetRandomAvatarPath} from "../users/avatar.js"

const userBodySchema = {
    type: 'object',
    required: ['name', 'username', 'email', 'password'],
    properties: {
        name: { type: 'string', minLength: 3 },
        username: { type: 'string', minLength: 4 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 }
    },
    additionalProperties: false 
}

export const registrationSchema = {
    body: userBodySchema
}

export async function register(req:FastifyRequest, res:FastifyReply) {
    console.log("Register endpoint called.");
    const { name, username, email, password } = req.body as
        { name: string; username: string; email: string; password: string };
    try {
        const UserFromDb = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        })
        if (UserFromDb){ // username or email found in db 
            if (UserFromDb.username == username)
                return res.code(409).send({ message: "username already in use."});
            else if (UserFromDb.email == email)
                return res.code(409).send({message: "email already in use."});
        }
        const password_hash:string = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS!))
        const avatar_path = GetRandomAvatarPath();
        const user = await prisma.user.create({
            data: {
                name, username, email, password_hash, avatar_path
            },
            select:{
                id:true, name: true, username:true, email:true,
                reg_date:true, refresh_token:true
            }
        })
        SetAccessTokenCookie(res, user.id)
        user.refresh_token = SetRefreshTokenCookie(res, user.id)
        await prisma.user.update({
            where: {
                id:user.id
            },
            data:{
                refresh_token:user.refresh_token
            }
        })
    }
    catch (error){
        req.log.error(error);
        return res.code(500).send({message: "server unexpected error."})
    }
    return res.code(201).send({ message: "User registered successfully." });
}
