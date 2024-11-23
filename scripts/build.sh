TAG=$1
ENV=$2

docker build \
--build-arg ENV=$ENV \
--build-arg ENV_FILE=.env.$ENV \
--no-cache \
--target graphql \
-t graphql-fn:$TAG .
