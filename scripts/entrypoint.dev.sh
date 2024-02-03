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

pnpm run build:dev && ./aws-lambda-rie pnpm aws-lambda-ric dist/index.handler || exit 1
