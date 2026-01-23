# 1. Use the same Node version as your other services
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 2. Copy the SHARED folder first
# Because context is root, we can see 'shared'
# COPY shared ./shared

WORKDIR /app/games

# 3. Copy package definitions first (for better caching)
# COPY package*.json ./
COPY . ./

COPY ./package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your game code

# 6. Expose the port we defined in the server (3002)
EXPOSE 3002

# 7. Start the server
# Note: Ensure your package.json has a "start" or "dev" script!
CMD ["npm", "run", "dev"]