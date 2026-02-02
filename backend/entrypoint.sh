#!/bin/sh

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo " node_modules missing or empty. Installing dependencies..."
    npm install

elif [ ! -f "node_modules/.bin/nodemon" ]; then
    echo "⚠️  Volume out of sync! Nodemon missing. Updating dependencies..."
    npm install

else
    echo " Dependencies look good."
fi

echo " Generating Prisma Client..."
npx prisma generate

echo "  Applying DB Schema..."
npx prisma db push

echo "Starting Server..."
exec "$@"