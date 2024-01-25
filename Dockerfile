# Base Image
FROM public.ecr.aws/lambda/nodejs:20 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


# Builder image
FROM base AS builder
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# RUN pnpm exec prisma generate

RUN pnpm run -r --if-present build
RUN pnpm run -r --if-present alias
RUN pnpm deploy --filter=waterlog-graphql --prod /prod/graphql
# RUN ["ls", "-a"]
# RUN exit 1


## GraphQL
FROM base AS graphql

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /prod/graphql ${LAMBDA_TASK_ROOT}


RUN ["ls", "-a"]
# RUN exit 1
RUN pnpx prisma generate
# RUN pnpm run alias

CMD ["dist/index.handler"]

# # Stage 2 -- only necessary files
# FROM public.ecr.aws/lambda/nodejs:20

# ENV NPM_CONFIG_CACHE=/tmp/.npm

# WORKDIR ${LAMBDA_TASK_ROOT}

# COPY --from=builder /usr/app/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node \
# ./node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node

# COPY --from=builder /usr/app/prisma/schema.prisma ./prisma/schema.prisma
# COPY --from=builder /usr/app/.env ./.env
# COPY --from=builder /usr/app/schema.gql ./schema.gql
# COPY --from=builder /usr/app/dist/* ./

# CMD ["index.handler"]
