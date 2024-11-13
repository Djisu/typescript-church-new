// src/@types/express.d.ts
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                isVerified: any;
                id: string;
                username: string;
                email: string;
                role: string;
                avatar: string;
                // Add any other fields you expect in the token
            };
            member?: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
                email: string;
                phone: string;
                address: string;
                membership_type: string;
                affiliated: string;
                password: string;
                role: string; 
            }   
        }
    }
}