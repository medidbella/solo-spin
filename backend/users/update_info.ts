import { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from "../prisma/database.js"
import bcrypt from "bcrypt";

export const PasswordUpdateSchema = {
    body: {
        type: 'object',
		required: ['oldPassword', 'newPassword', 'verifyNewPassword'],
        properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
			verifyNewPassword: { type: 'string', minLength: 8 }
        },
        additionalProperties: false
    }
}

export const UserDataUpdateSchema = {
	body: {
		type: 'object',
		properties:
		{
		    name: { type: 'string', minLength: 3 },
    	    username: { type: 'string', minLength: 4 },
    	    email: { type: 'string', format: 'email' },
		},
		additionalProperties: false
	}
}

export async function inputCleaner(req:FastifyRequest){
	const body = req.body as any;
	Object.keys(body).forEach(key => {
	    if (body[key] === '') {
	        delete body[key];
	    }
	});
}

export async function updateUserInfo(req: FastifyRequest, res:FastifyReply)
{
	const userId = (req.user as any).sub;
    const cleanData = req.body as any;

    if (Object.keys(cleanData).length === 0) {
        return res.code(400).send({message: "No changes detected", StatusCode: 400});
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: cleanData,
            select: {
                username: true,
                email: true,
                name: true
            }
        });
        return res.send(updatedUser);

    } catch (error: any) {
		if (error.code === 'P2025') {//when user not found
			return res.code(401).send({
				message: "User not found.",
				StatusCode: 401
			});
		}
        if (error.code === 'P2002') {//when trying to update to a username/email that already exists
			console.log(error)
            const target = error.meta?.target?.[0] || 'Field';
            return res.code(409).send({ 
                message: `This ${target} is already taken.`,
				StatusCode: 409
            });
        }
        req.log.error(error);
        return res.code(500).send({ message: "Internal Server Error", StatusCode: 500});
    }
}

export async function updateUserPassword (req: FastifyRequest, res:FastifyReply)
{
	const userId = (req.user as any).sub;
	const { oldPassword, newPassword, verifyNewPassword } = req.body as
		{ oldPassword: string; newPassword: string; verifyNewPassword: string };

	if (newPassword !== verifyNewPassword) {
		return res.code(400).send({ message: "New password and verification do not match.", StatusCode: 400});
	}
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { password_hash: true }
		});
		if (!user || !(await bcrypt.compare(oldPassword, user.password_hash!))) {
			return res.code(401).send({ message: "Old password is incorrect.", StatusCode: 401});
		}
		const newHashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUNDS!) || 10);
		await prisma.user.update({
			where: { id: userId },
			data: { password_hash: newHashedPassword }
		})
	}
	catch (error){
		req.log.error(error);
		return res.code(500).send({message: "server unexpected error.", StatusCode: 500})
	}
	return res.send({ message: "Password updated successfully." });
}
