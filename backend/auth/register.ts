import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../database.js"
import bcrypt from "bcrypt";

function GetRandomAvatarPath():string{
    let image_names = ["avatar1.png", "avatar2.png", "avatar3.png"]
    let num = Math.floor(Math.random()) % image_names.length + 1;
    return image_names.at(num)!;
}

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

export async function register(req:FastifyRequest, reply:FastifyReply) {
    const { name, username, email, password } = req.body as
        { name: string; username: string; email: string; password: string };
    try {
        const UserFromDb = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }})
        if (UserFromDb){ // username or email found in db 
            if (UserFromDb.username == username)
                return reply.code(409).send({ message: "username already in use."});
            else if (UserFromDb.email == email)
                return reply.code(409).send({message: "email already in use."});
        }
        const password_hash:string = await bcrypt.hash(password, process.env.SALT_ROUNDS!)
        const avatar_path = GetRandomAvatarPath();
        await prisma.user.create({
            data: {
                name, username, email, password_hash, avatar_path
            },
            select:{
                id:true, name: true, username:true, email:true, reg_date:true
            }
        })
    }
    catch (error){
        req.log.error(error);
        return reply.code(500).send({message: "server unexpected error."})
    }
    return reply.code(201).send({ message: "User registered successfully." });
}
