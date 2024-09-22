// config.ts
export interface IConfig {
    jwtSecret: string;
    // other configuration properties
  }
  
  const config: IConfig = {
    jwtSecret: 'mysecrettoken',
    // other configuration values
  };
  
  export default config;