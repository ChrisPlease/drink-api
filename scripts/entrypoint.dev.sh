#!/bin/bash

# HANDLER=$1

# if [-z "$HANDLER"]
# then
#   echo "No handler specified. Usage: $0 <handler>"
#   exit 1
# fi

# PID=$(lsof -t -i:8080)
# if [ -z "$PID" ]
# then
#     echo "No PID found"
# else
#     echo "Killing PID $PID"
#     kill $PID
# fi

# echo "Restarting..."

pnpm run build:dev && exec /usr/local/bin/aws-lambda-rie pnpm exec -- aws-lambda-ric dist/index.handler || exit 1
