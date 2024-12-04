export {}

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      UI_DOMAIN: string;

      HOST: string;
      PORT: string;

      NUTRITIONIX_API: string;
      NUTRITIONIX_API_KEY: string;
      NUTRITIONIX_APP_ID: string;

      REDIS_USER: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_PASSWORD: string;

      PGUSER: string;
      PGHOST: string;
      PGPASSWORD: string;
      PGDATABASE: string;

      AUTH0_DOMAIN: string;
      AUTH0_AUDIENCE: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_CLIENT_SECRET: string;
      AUTH0_CALLBACK_URI: string;
      JWKS_URI: string;

      DATABASE_URL: string;
      DIRECT_URL: string;

      // AWS
      AWS_REGION: string;
      AWS_DEFAULT_REGION: string;
      AWS_LAMBDA_FUNCTION_NAME: string;

      NUTRITIONIX_LAMBDA: string;
    }
  }
}
