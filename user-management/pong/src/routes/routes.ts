
import { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";

function registerPongPlayers(server: FastifyInstance) {
    server.post('/api/pong/register', async (request: FastifyRequest, reply: FastifyReply) => {
		console.log("📝 /register-player POST hit");
        // 1. no need for body
        // 2. get name + id from cookies
        // 3. create the new player
        // 4. add player to online players room + available players room
        // 4. set web socket
    });
}

function registerPongRoutes(server: FastifyInstance) {

    registerPongPlayers(server);

}

export { registerPongRoutes };