# Water Log API

Welcome to the Waterlog API. 

This app is a GraphQL lambda (and associated lambdas) for creating and editing "Drinks", and logging "Entries". 

## Development Guide

### Requirements

* [Auth0](https://auth0.com/)
* [Docker](https://www.docker.com/)
* [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

### Getting started 

* Clone the repo
* Copy `.env.sample`, rename to `.env` and populate variables

#### DB and migrations

This project uses Postgres@16 in a docker container. To set up the db: 

```sh
% docker compose up -d
```

To run migrations and seed the database, run a dev container of the graphql-lambda:

```sh
% docker build -f Dockerfile.dev -t graphql-lambda:dev .
% docker run -it graphql-lambda:dev /bin/bash 

% pnpm prisma migrate dev

# After migrations, you don't need this container anymore, feel free to delete
```

#### Building the project

```sh
% pnpm build
```

#### Running the project

This project uses the aws sam cli for testing and deployment. To begin using the 
lambdas locally, run
