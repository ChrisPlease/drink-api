#!/usr/bin/env bash
export $(grep -v '^#' .env | xargs)

# If an additional environment file is specified, use it to overwrite variables
if [ -n "$1" ]; then
    export $(grep -v '^#' .env.$1 | xargs)
fi


