# 1. Use the same Node version as your other services
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package definitions first (for better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your game code
COPY . .

# 6. Expose the port we defined in the server (3002)
EXPOSE 3002

# 7. Start the server
# Note: Ensure your package.json has a "start" or "dev" script!
CMD ["npm", "run", "dev"]