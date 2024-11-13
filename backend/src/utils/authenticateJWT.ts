import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Define the structure of the user object you expect
interface UserPayload {
    id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
    isVerified: boolean;
}

const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    console.log('process.env.JWT_SECRET: ', process.env.JWT_SECRET )
    
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>

    console.log('backend: token', token)

    console.log('backend: in authenticateJWT')

    if (!token) {
         res.sendStatus(403); // Forbidden if no token is provided
         return
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: UserPayload | undefined) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.sendStatus(403); // Forbidden if the token is invalid
        }

        if (user) {
            req.user = user; // Attach user data to the request object
            console.log('Authenticated user:', user); // Log user information 
        }
        
        next(); // Call the next middleware or route handler
    });
};

export default authenticateJWT;