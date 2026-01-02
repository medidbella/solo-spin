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


RUN npm install --omit=dev

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]

#should map a host dir to /app/avatars

# also map the location of dev.db to /app/dev.db