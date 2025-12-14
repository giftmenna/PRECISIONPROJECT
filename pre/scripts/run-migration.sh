#!/bin/bash

# Set the database URL from environment variable or use a default
DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/postgres"}

# Run the SQL migration file
psql $DATABASE_URL -f prisma/migrations/20240830_competition_status_enum.sql

echo "Migration completed successfully!"
