import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import {register, registrationSchema} from "./auth/register.js";
import {login, loginSchema} from './auth/login.js';
import {authVerifier} from './auth/jwt.js';
import {refresh} from './auth/refresh.js';
import {me} from "./me.js";
import {logout} from "./auth/logout.js"

const app = Fastify({logger:true});

app.register(fastifyCookie)

app.register(fastifyJwt, {
	secret: process.env.JWT_ACCESS_SECRET!,
	cookie: {
    cookieName: 'accessToken',
    signed: false
  }
})

app.post("/register", {schema:registrationSchema}, register)

app.post("/login", {schema:loginSchema}, login)

app.get("/me", {preHandler:authVerifier}, me)

app.post("/refresh", refresh) 

app.post("/logout", logout)

app.listen({ port: 3000 });

export {app}
