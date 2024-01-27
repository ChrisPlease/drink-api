# Base Image
FROM public.ecr.aws/lambda/nodejs:20 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV LAMBDA_TASK_ROOT="/var/task"
RUN corepack enable


# Builder image
FROM base AS builder
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --if-present build
RUN pnpm run -r --if-present alias

# Authorizer deploy
RUN pnpm deploy --filter=authorizer --prod /prod/authorizer

# GraphQL deploy
RUN pnpm deploy --filter=waterlog-graphql --prod /prod/graphql

# Callback deploy
RUN pnpm deploy --filter=auth-callback --prod /prod/callback


## Authorizer Build
FROM base AS authorizer

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /prod/authorizer ${LAMBDA_TASK_ROOT}

CMD ["dist/index.handler"]

## GraphQL Build
FROM base AS graphql

WORKDIR ${LAMBDA_TASK_ROOT}
COPY ./.env.production ./.env
COPY --from=builder /prod/graphql ${LAMBDA_TASK_ROOT}

RUN pnpx prisma generate

CMD ["dist/index.handler"]

## Auth Callback Build
FROM base AS auth-callback

WORKDIR ${LAMBDA_TASK_ROOT}
COPY ./.env.production ./.env

COPY --from=builder /prod/callback ${LAMBDA_TASK_ROOT}

CMD ["dist/index.handler"]
