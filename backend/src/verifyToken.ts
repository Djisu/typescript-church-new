import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/Users';

interface CustomRequest extends Request {
    user: IUser;
  }

// Middleware to verify the JWT token
const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your-secret-key');
      req.user = decoded as IUser; // Type assertion to ensure the decoded object matches the IUser interface
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
  };
// Example of a protected route
// app.get('/protected', verifyToken, (req: Request, res: Response) => {
//   res.json({ message: 'This is a protected route' });
// });