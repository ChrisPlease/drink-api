#!/bin/bash

# This script will kill the process running on port 8080 if it exists and then do other things
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  echo "${AWS_LAMBDA_RUNTIME_API}"
  pnpm --filter auth-callback run build:dev && exec /usr/local/bin/aws-lambda-rie pnpm exec -- aws-lambda-ric $@
else
  exec pnpm exec -- aws-lambda-ric $@
fi

# PID=$(lsof -t -i:8080)
# if [ -z "$PID" ]
# then
#     echo "No PID found"
# else
#     echo "Killing PID $PID"
#     kill $PID
# fi

# echo "Restarting..."
# pnpm run build:dev && ./aws-lambda-rie pnpm aws-lambda-ric dist/index.handler || exit 1
