FROM node:18.12-alpine3.16

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

COPY ./src ./src

RUN echo ${HOST}
RUN npm install
