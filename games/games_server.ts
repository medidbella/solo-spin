import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import webSocket from '@fastify/websocket';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';

import { registerGamesRoutes } from "./src/routes/routes";
import { pongGameSessionsRoom } from './src/pong/pong_memory';

const server: FastifyInstance = Fastify( { 
	logger: {
	transport: {
	  targets: [
		{
		  target: 'pino/file',
		  options: { 
			destination: '../logs/games.log',
			mkdir: true 
		  }
		},
		{
		  target: 'pino-pretty',
		  options: { 
			colorize: true, 
			translateTime: "SYS:standard",
			ignore: 'pid,hostname',
			singleLine: true
		  }
		}
	  ]
	}
  } 
});

server.register(cookie);
server.register(webSocket);
server.register(fastifyJwt, {
	secret: process.env.JWT_ACCESS_SECRET!
});

server.register(cors, {
	origin: true,
	credentials: true
});

server.register(async (childServer: FastifyInstance) => {
    registerGamesRoutes(childServer);
});

server.addHook('onClose', (instance: any, done: any) => {
	pongGameSessionsRoom.stopGlobalLoop();
	done();
	instance;
});

const start = async () => {
	try {
        const port = Number(process.env.GAMES_PORT) || 3002;
        const host: string = "0.0.0.0";
		await server.listen({ port, host });
		console.log(` [GAMES SERVER]: Games service is running on http://0.0.0.0:${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
