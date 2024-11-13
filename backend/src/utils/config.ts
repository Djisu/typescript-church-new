// config.ts
export interface IConfig {
    jwtSecret: string;
    // other configuration properties
  }
  
  const config: IConfig = {
    jwtSecret: process.env.JWT_SECRET || 'default-secret', // fallback for local development
    // other configuration values
  };
  
  export default config;