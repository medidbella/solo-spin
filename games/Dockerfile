# --- Stage 1: Base & Dependencies ---
FROM node:24-alpine AS base

WORKDIR /app

COPY games/package*.json ./games/

# Install dependencies inside the games folder
WORKDIR /app/games
RUN npm install

# --- Stage 2: Development ---
FROM base AS development
# Copy shared and games source code
WORKDIR /app
COPY shared ./shared
COPY games ./games

WORKDIR /app/games
EXPOSE 3002
CMD ["npm", "run", "dev"]

# --- Stage 3: Builder (Production Build) ---
FROM base AS builder
WORKDIR /app
COPY shared ./shared
COPY games ./games

WORKDIR /app/games
RUN npm run build

# --- Stage 4: Production Run ---
FROM node:24-alpine AS production
WORKDIR /app/games

# Only copy the production dependencies and the built files
COPY games/package*.json ./
RUN npm install --omit=dev

# Copy the compiled code from the builder stage
COPY --from=builder /app/games/dist ./dist
# If your app needs the shared types/files at runtime, copy them here
COPY --from=builder /app/shared ../shared

EXPOSE 3002
# fixed the path & server file name
CMD ["node", "/app/games/dist/games/games_server.js"]