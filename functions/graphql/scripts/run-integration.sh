#!/usr/bin/env bash

DIR="$(cd "$(dirname "$0")" && pwd)"

source $DIR/setenv.sh
docker compose --env-file ./.env.test -f docker-compose.test.yml up -d

echo '🟡 - Waiting for database to be ready...'

$DIR/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'

npx prisma migrate dev --name init

vitest -c ./vitest.config.integration.ts "$@";
