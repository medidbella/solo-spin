import { FastifyRequest, FastifyReply } from "fastify";
import {authenticator} from 'otplib'
import { prisma } from "../database.js";
import { User } from "@prisma/client";
import {SetAccessTokenCookie, SetRefreshTokenCookie} from "./jwt.js"

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

export const twoFaVerifySchema = {
	body: {
		type: "object",
		required: ["code", "mfaToken"],
		properties: {
			code: { type: "string", minLength: 6, maxLength: 6},
			mfaToken: {type: "string"}
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

function CheckPossibleErrors(res: FastifyReply, code: string, user: any): FastifyReply | undefined
{
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
}

export async function TwoFactorValidator(req: FastifyRequest, res: FastifyReply)
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
		if (CheckPossibleErrors(res, code, user))
			return ;
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

export function TwoFactoLoginController(res:FastifyReply, user:User)
{
	const mfaToken = res.server.jwt.sign({
		sub:user.id,
		type:"2fa_temp"},
		{ expiresIn: "4m"}
	)
	res.code(200).send({requires2FA: true, mfaToken})
}
export async function TwoFactorLoginVerify(req: FastifyRequest, res: FastifyReply)
{
	const {code, mfaToken} = req.body as {code:string, mfaToken:string}
	console.log(`code: ${code}`)
	console.log(`token:\n\t${mfaToken}`)
	try {
		const decoded = req.server.jwt.verify(mfaToken)
		console.log("token verified successfully")
		if ((decoded as any).type != "2fa_temp")
			return (res.code(401).send({message: "Invalid token type"}))
		const user_id = parseInt((decoded as any).sub)
		const user = await prisma.user.findFirst({
			where: {
				id : user_id
			},
			select: {
				refresh_token:true,
				two_factor_enabled:true,
				two_factor_secret:true
			}
		})
		if (user && !user.two_factor_enabled)
			return res.code(401).send({message: "User 2FA is disabled, try enabling it first"})
		else if (CheckPossibleErrors(res, code, user))
			return ;
		SetAccessTokenCookie(res, user_id)
		const token = SetRefreshTokenCookie(res, user_id)
		prisma.user.update({
			where: {
				id:user_id
			},
			data:{
				refresh_token:token
			}
		})
	}
	catch(error){
		return res.code(500).send({message: "Server unexpected error", error})
	}
	return res.code(200).send({message:"user logged in successfully"})
}
