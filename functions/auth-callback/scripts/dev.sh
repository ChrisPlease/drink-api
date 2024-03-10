#!/bin/bash

PID=$(lsof -t -i:8080)
if [ -z "$PID" ]
then
    echo "No PID found"
else
    echo "Killing PID $PID"
    kill $PID
fi

echo "Restarting..."

pnpm run build:dev && exec /usr/local/bin/aws-lambda-rie pnpm exec -- aws-lambda-ric dist/index.handler || exit 1
