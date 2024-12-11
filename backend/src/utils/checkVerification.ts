import { Request, Response, NextFunction } from "express";

// Define the structure of the user object you expect
interface MemberPayload {
    id: string;
    username: string;
    email: string;
    role: string;
    isVerified: boolean;
}


// Middleware to check if the user is verified
export const checkVerification = (req: Request, res: Response, next: NextFunction): void => {
    const member: MemberPayload = req.user as MemberPayload;
    console.log('checkVerification middleware')
    
    // console.log('user: ', user)
    // console.log('user.isVerified: ', user.isVerified)
    // console.log('req.headers: ', req.headers)
    // console.log('req.body: ', req.body)
    // console.log('req.user: ', req.user)

    if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return
    }
    if (!req.user.isVerified) {
         res.status(403).json({ message: 'Email not verified' });
         return
    }
    next();
};