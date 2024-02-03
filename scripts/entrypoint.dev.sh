#!/bin/bash

# This script will kill the process running on port 8080 if it exists and then do other things

PID=$(lsof -t -i:8080)
if [ -z "$PID" ]
then
    echo "No PID found"
else
    echo "Killing PID $PID"
    kill $PID
fi

echo "Restarting..."
pnpm run build:dev;
echo "Rebuilt"
./aws-lambda-rie pnpx aws-lambda-ric dist/index.handler || exit 1
