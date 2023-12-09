export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
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

      CERTBOT_EMAIL: string;
      STAGING?: string;
      DEBUG?: string;
      USE_LOCAL_CA?: string;

      DATABASE_URL: string;
    }
  }
}
