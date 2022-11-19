FROM node:16.18.0-alpine3.16

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

COPY ./src ./src

ENV PORT ${PORT}
EXPOSE ${PORT}

RUN npm ci
RUN rm -rf .env

CMD npm start
