FROM node:18-bullseye

WORKDIR /usr/app

RUN apt-get update && \
apt-get install -y \
g++ \
make \
cmake \
unzip \
libcurl4-openssl-dev \
lsof

COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

RUN npm ci
RUN npm i aws-lambda-ric

COPY ./src ./src
COPY ./prisma ./prisma
COPY ./schema.gql ./

COPY ./scripts/entrypoint.dev.sh ./
RUN chmod +x ./entrypoint.dev.sh

COPY aws-lambda-rie ./aws-lambda-rie
RUN chmod +x ./aws-lambda-rie

# RUN npx prisma generate
RUN npm run dev:build
CMD ["npm", "start"]
