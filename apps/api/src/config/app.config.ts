export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  storage: {
    bucketName: string;
    basePath: string;
  };
}

export const appConfig = (): { app: AppConfig } => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    database: {
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5432),
      name: process.env.DATABASE_NAME ?? 'shopping_fretes',
      username: process.env.DATABASE_USER ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'postgres',
      ssl: process.env.DATABASE_SSL === 'true',
    },
    storage: {
      bucketName: process.env.GCS_BUCKET_NAME ?? '',
      basePath: process.env.LOCAL_STORAGE_PATH ?? 'storage',
    },
  },
});
