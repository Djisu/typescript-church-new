declare module 'multer' {
    import { Request, Response, NextFunction } from 'express';
  
    export interface Multer {
      (options?: any): (req: Request, res: Response, next: NextFunction) => void;
    }
  
    export function diskStorage(options?: any): any;
    export function memoryStorage(): any;
  
    // Add other necessary typings as needed
  }