// Import necessary modules
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a new interface for the authenticated user
interface AuthenticatedUser {
  id: string;       // Required
  username: string; // Required
  email: string;    // Required
  role: string;     // Required
  avatar: string;   // Required (no longer optional)
  isVerified: boolean; // Optional
}

// Extend the Request interface with CustomRequest
interface CustomRequest extends Request {
  user?: AuthenticatedUser; // Use the new AuthenticatedUser type here
}

// Middleware to verify the JWT token
const verifyToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
     res.status(401).json({ message: 'No token provided' });
     return
  }

  try {
      const decoded = jwt.verify(token, 'your-secret-key');

      // Create a user object that matches the AuthenticatedUser interface
      req.user = {
          id: (decoded as any).id, // Assuming `id` is included in the token payload
          username: (decoded as any).username,
          email: (decoded as any).email,
          role: (decoded as any).role,
          avatar: (decoded as any).avatar || '', // Provide a default value if needed
      } as AuthenticatedUser; // Type assertion

      next();
  } catch (error) {
      res.status(403).json({ message: 'Failed to authenticate token' });
      return
  }
};

export default verifyToken;