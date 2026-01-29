# 1. Base Image (Node 24 non-existent yet, using 22-alpine or lts-alpine is safer)
FROM node:24-alpine

# 2. Set working directory
WORKDIR /app/games

# 3. Optimize Caching: Copy package files FIRST
# This allows Docker to cache dependencies if package.json didn't change.
COPY package*.json ./

# 4. Install dependencies (Including dotenv, pino-pretty, etc.)
RUN npm install

# 5. Copy the rest of the code
# This layer changes often, but it won't force npm install to run again.
COPY . .

# 6. Expose the port
EXPOSE 3002

# 7. Start command
CMD ["npm", "run", "dev"]