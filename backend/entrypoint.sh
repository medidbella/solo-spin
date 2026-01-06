#!/bin/sh

echo "Starting Backend Container..."

# 1. Check & Install Node Modules
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo " Installing dependencies..."
    npm install
fi

# 2. Generate Prisma Client
echo " Generating Prisma Client..."
npx prisma generate

# 3. Push Schema to Database
echo " Applying DB Schema..."
npx prisma db push

# 4. Start Server
echo " Starting Server..."
exec "$@"