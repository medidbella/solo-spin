import { FastifyRequest, FastifyReply } from "fastify";
import {authenticator} from 'otplib'
import { prisma } from "../prisma/database.js";
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

export async function EnableTwoFactoAuth(req: FastifyRequest, res: FastifyReply)
{
	let otpAuthUrl: string
	const user_id = (req.user as any).sub
	try {
		const user = await prisma.user.findUnique({
			where: {
				id :user_id
			},
			select: {
				two_factor_enabled: true
			}
		})
		if (!user) {
			return res.code(401).send({
				message: "User associated with token not found or account deactivated. Please log in again.",
				statusCode: 401
			})
		}
		else if (user.two_factor_enabled){
			return res.code(409).send({
				message: "2FA is already enabled",
				statusCode: 409
			})
		}
		const secret = authenticator.generateSecret()
		const updatedUser = await prisma.user.update({
			where: {
				id : (req.user as any).sub,
				two_factor_enabled: false
			},
			data: {
				two_factor_secret: secret
			},
			select: {
				email:true
			}
		})
		otpAuthUrl = authenticator.keyuri(updatedUser.email, "SoloSpin", secret)
	}
	catch (err:any)
	{
		req.log.error(err);
		return res.code(500).send({
			message: "Server unexpected error",
			statusCode: 500
		})
	}
	return res.code(201).send({message: "2FA secret generated waiting for validation", otpAuthUrl})
}

function CheckPossibleErrors(res: FastifyReply, code: string, user: any): FastifyReply | undefined
{
	if (!user){
		return res.code(401).send({
			message: "User associated with token not found or account deactivated. Please log in again.",
			statusCode: 401
		})
	}
	if (!user.two_factor_secret){
		return res.code(400).send({
			message: "Two factor authentication secret is not set yet", statusCode: 400
		})
	}
	if (!authenticator.check(code, user.two_factor_secret)){
		return res.code(401).send({
			message: "Wrong 2FA key, please try again", statusCode: 401
		})
	}
}

export async function TwoFactorValidator(req: FastifyRequest, res: FastifyReply)
{
	const { code } = req.body as {code:string}
	const user_id = (req.user as any).sub
	try {
		const user = await prisma.user.findUnique({
			where: {
				id : user_id
			},
			select: {
				two_factor_secret: true
			}
		})
		if (CheckPossibleErrors(res, code, user))
			return ;
		await prisma.user.update({
			where: {
				id : user_id
			},
			data: {
				two_factor_enabled: true
			}
		})
	}
	catch (err){
		req.log.error(err);
		return res.code(500).send({
			message: "Server unexpected error",
			statusCode: 500
		})
	}
	return res.code(201).send({message: "2FA is enabled successfully"})
}

export function TwoFactoLoginController(res:FastifyReply, host:string, user_id:number, oauth_case:boolean)
{
	const mfaToken = res.server.jwt.sign({
		sub:user_id,
		type:"2fa_temp"},
		{ expiresIn: "4m"
	})
	res.cookie("mfaToken", mfaToken, {
		path: '/api/2fa/verify',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: new Date(Date.now() + 4 * 60 * 1000)
	})
	if (oauth_case)
		return (res.redirect(`https://${host}:8443/login?requires2FA=true`))
	return (res.code(202).send({requires2FA: true}));
}

export async function TwoFactorLoginVerify(req: FastifyRequest, res: FastifyReply)
{
	const {code} = req.body as {code:string}
	try {
		const user_id = (req.user as any).sub
		// console.log(`\nuser id = ${user_id}\n`)
		const user = await prisma.user.findUnique({
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
			return res.code(401).send({message: "User 2FA is disabled, try enabling it first", statusCode: 401})
		else if (CheckPossibleErrors(res, code, user))
			return ;
		SetAccessTokenCookie(res, user_id)
		const token = SetRefreshTokenCookie(res, user_id)
		await prisma.user.update({
			where: {
				id:user_id
			},
			data:{
				refresh_token:token
			}
		})
	}
	catch (error:any)
	{
		if (error.code == 'FAST_JWT_EXPIRED'){
			return res.code(401).send({message: "expired temp token, please try to login again", statusCode: 401})
		}
		else if (error.code == 'FAST_JWT_INVALID_SIGNATURE' || error.code == 'FAST_JWT_MALFORMED'){
			return res.code(401).send({message: "invalid temp token, please try to login again", statusCode: 401})
		}
		req.log.error(error);
		return res.code(500).send({message: "Server unexpected error", statusCode: 500})
	}
	return res.code(200).send({message:"user logged in successfully"})
}
