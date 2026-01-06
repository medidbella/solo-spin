FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

COPY entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/entrypoint.sh

RUN npm install
RUN npx prisma generate

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]

CMD ["node", "dist/server.js"]