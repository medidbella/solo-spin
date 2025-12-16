import "@fastify/jwt"
import { JWT } from "@fastify/jwt"

declare module "fastify" {

  interface FastifyInstance {
    access: JWT;
    refresh: JWT;
  }

  interface FastifyRequest {
    accessJwtVerify: () => Promise<void>;
    refreshJwtVerify: () => Promise<void>;
  }
}