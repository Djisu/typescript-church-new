declare module 'express' {
    export interface Request {
      // Extend the Request interface as needed
      body?: any;
      params?: { [key: string]: any };
      query?: { [key: string]: any };
    }
  
    export interface Response {
      // Extend the Response interface as needed
      json: (body: any) => Response;
      send: (body?: any) => Response;
    }
  
    export interface NextFunction {
      (err?: any): void;
    }
  
    export interface Router {
      // Define additional properties or methods as needed
      get: (path: string, handler: (req: Request, res: Response, next: NextFunction) => void) => Router;
      post: (path: string, handler: (req: Request, res: Response, next: NextFunction) => void) => Router;
      // Add other HTTP methods as needed
    }
  
    export function Router(): Router;
  
    export function request(req: Request, res: Response, next?: NextFunction): void;
    export function response(req: Request, res: Response): void;
  }