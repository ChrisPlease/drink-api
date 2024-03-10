#!/bin/bash

LAMBDA_PATH="$LAMBDA_TASK_ROOT/$1"
ls -la

cp ./dev.sh $LAMBDA_PATH/dev.sh
cd "$LAMBDA_TASK_ROOT/$1"

chmod +x ./dev.sh

exec $2
