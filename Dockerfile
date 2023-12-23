FROM node:18-alpine3.18

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig.json ./

COPY ./src ./src
COPY ./prisma ./prisma
COPY ./schema.gql ./

RUN npm ci
RUN npx prisma generate
RUN npm run dev:build
CMD npm start
