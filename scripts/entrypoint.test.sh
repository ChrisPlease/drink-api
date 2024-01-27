#!/bin/bash

# Usage: ./entrypoint.sh .env.foo [additional arguments for sam local start-api]

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <env_file> [additional arguments for sam local start-api]"
    exit 1
fi

ENV_FILE="$1"
shift  # Remove the first argument and keep the rest

# Check if the environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Environment file not found: $ENV_FILE"
    exit 1
fi

# Export environment variables from the file
while IFS='=' read -r key value || [[ -n "$key" ]]; do
    # Skip empty lines and lines starting with #
    if [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]]; then
        continue
    fi

    # Remove leading and trailing quotes from the value
    value="${value%\"}"
    value="${value#\"}"

    # Now re-add quotes around the value and export it
    export "$key=\"$value\""
done < "$ENV_FILE"

# Run SAM Local with additional arguments
sam local start-api "$@"

# Unsetting the environment variables
while IFS='=' read -r key value || [[ -n "$key" ]]; do
    # Skip empty lines and lines starting with #
    [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]] && continue
    unset "$key"
done < "$ENV_FILE"
