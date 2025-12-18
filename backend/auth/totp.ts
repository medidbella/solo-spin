import { FastifyRequest, FastifyReply } from "fastify";
import {authenticator} from 'otplib'
import { prisma } from "../database.js";
import { runInThisContext } from "vm";

export const twoFaValidatorSchema = {
	body: {
		type: "object",
		required: ["code"],
		properties: {
			code: { type: "string", minLength: 6, maxLength: 6},
		},
		additionalProperties: false
	}
}

export async function EnableTwoFactoAuth(req: FastifyRequest, res: FastifyReply)
{
	let otpAuthUrl: string
	try {
		const secret = authenticator.generateSecret()
		const user = await prisma.user.update({
			where:{
				id : (req.user as any).sub
			},
			data:{
				two_factor_secret: secret
			},
			select: {
				email:true
			}
		})
		if (!user){
			return res.code(401).send({
				message: "User associated with token not found or account deactivated. Please log in again."
			})
		}
		otpAuthUrl = authenticator.keyuri(user.email, "SoloSpin", secret)
	}
	catch (err){
		return res.code(500).send({
			message: "Server unexpected error"
		})
	}
	return res.code(201).send({message: "2FA secret generated waiting for validation", otpAuthUrl})
}

export async function TwoFactorCodeValidator(req: FastifyRequest, res: FastifyReply)
{
	const { code } = req.body as {code:string}
	try {
		const user = await prisma.user.findFirst({
			where: {
				id : (req.user as any).sub
			},
			select: {
				two_factor_secret: true
			}
		})
		if (!user){
			return res.code(401).send({
				message: "User associated with token not found or account deactivated. Please log in again."
			})
		}
		if (!user.two_factor_secret){
			return res.code(400).send({
				message: "Two factor authentication secret is not set yet"
			})
		}
		if (!authenticator.check(code, user.two_factor_secret)){
			return res.code(401).send({
				message: "Wrong 2FA key, try again"
			})
		}
		await prisma.user.update({
			where: {
				id : (req.user as any).sub
			},
			data: {
				two_factor_enabled: true
			}
		})
	}
	catch (err){
		return res.code(500).send({
			message: "Server unexpected error"
		})
	}
	return res.code(201).send({message: "2FA is enabled successfully"})
}
