FROM node:18-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY ["package.json", "package-lock.json", "tsconfig.json", "./"]

COPY ./src ./src

RUN npm ci
RUN npx prisma generate
CMD npm start
