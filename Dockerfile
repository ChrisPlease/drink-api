FROM node:18-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

COPY ./src ./src

RUN npm ci
RUN npx prisma generate
RUN npm run dev:build
CMD npm start
