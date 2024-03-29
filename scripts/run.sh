#!/bin/bash

# Capture all arguments passed to the script as the command to run
COMMAND="$*"

# Check if the NODE_ENV variable is set and not empty
if [[ -n "$NODE_ENV" ]]; then
    # NODE_ENV is set and not empty, append it to the .env file
    DOTENV_FILE=".env.$NODE_ENV"
    FULL_COMMAND="pnpm dotenvx run --env-file=$DOTENV_FILE -- $COMMAND"
else
    # NODE_ENV is not set, use the default .env file
    FULL_COMMAND="pnpm dotenvx run -- $COMMAND"
fi

echo "Running command: $FULL_COMMAND"
# Execute the command
eval $FULL_COMMAND
