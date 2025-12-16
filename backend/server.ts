import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import {register, registrationSchema} from "./auth/register.js"
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { login, loginSchema } from './auth/login.js';
import { authVerifier } from './auth/jwt.js';
import { refresh } from './auth/refresh.js';
import {me} from "./me.js"

const app = Fastify({logger:true});

app.register(fastifyJwt, {
	secret: process.env.JWT_ACCESS_SECRET!,
	namespace: 'access',
	cookie:{
		cookieName: 'accessToken',
		signed: false
	}
})

app.register(fastifyJwt, {
	secret: process.env.JWT_REFRESH_SECRET!,
	namespace: 'refresh',
	cookie:{
		cookieName: 'refreshToken',
		signed: false
	}
})

app.register(fastifyCookie)

app.post("/register", {schema:registrationSchema}, register)

app.post("/login", {schema:loginSchema}, login)

app.get("/me", {preHandler:authVerifier}, me)

app.post("/refresh", refresh) 

app.listen({ port: 3000 });

export {app}
