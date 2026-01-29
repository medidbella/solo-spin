#!/bin/sh

DB_FILE="/app/dev.db"

if [ ! -f "$DB_FILE" ]; then
    echo "🗄️ Database file not found. Creating empty dev.db..."
    touch "$DB_FILE"
    echo "✅ dev.db created."
else
    echo "✅ dev.db already exists."
fi

# Execute the passed command (e.g., npm run dev)
exec "$@"