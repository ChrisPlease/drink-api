# Builder image
FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /usr/app

COPY prisma ./prisma
COPY schema.gql ./
COPY .env.production ./.env

COPY ["package*.json", "tsconfig.json", "./"]

COPY ./src ./src

RUN npm ci
RUN pnpm exec prisma generate

RUN npm run build

# Stage 2 -- only necessary files
FROM public.ecr.aws/lambda/nodejs:20

ENV NPM_CONFIG_CACHE=/tmp/.npm

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node \
./node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node

COPY --from=builder /usr/app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /usr/app/.env ./.env
COPY --from=builder /usr/app/schema.gql ./schema.gql
COPY --from=builder /usr/app/dist/* ./

CMD ["index.handler"]
