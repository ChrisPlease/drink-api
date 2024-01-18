#!/bin/bash

env_name=${1:-}

DIR="$(cd "$(dirname "$0")" && pwd)"

source $DIR/setenv.sh $env_name

"$@"
