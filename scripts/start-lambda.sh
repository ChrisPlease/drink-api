DIR="$(cd "$(dirname "$0")" && pwd)"

source $DIR/setenv.sh

sam local start-lambda
