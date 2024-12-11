import express from 'express';
import { Request, Response } from 'express';

// import expressValidator from 'express-validator';
// const { check, validationResult } = expressValidator;
import { check, validationResult } from 'express-validator';

import jwt from 'jsonwebtoken';

import config from '../../utils/config.js';
import { User, IUser } from '../../../models/Users.js';

import { sendResetEmailUser } from '../../utils/emailUser.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
dotenv.config();

let frontendUrl = "" // Set frontend URL based on node environment

const nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'development'){
    frontendUrl = "http://localhost:5173";
} else if (nodeEnv === 'production'){
    frontendUrl = "https://typescript-church-new.onrender.com";
} else if (nodeEnv === 'test'){
    console.log('Just testing')
} else {
    console.log('Invalid node environment variable') //.slice()
}

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user with email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: The password of the user (6 or more characters).
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login, returns a token and user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JSON Web Token for authentication.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User's unique identifier.
 *                       example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                     username:
 *                       type: string
 *                       description: User's username.
 *                       example: "john_doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address.
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       description: User's role in the system.
 *                       example: "user"
 *                     avatar:
 *                       type: string
 *                       description: URL to the user's avatar image.
 *                       example: "https://example.com/avatar.jpg"
 *       400:
 *         description: Invalid credentials or validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Error message.
 *                         example: "Invalid Credentials"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Server error"
 */
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req: Request, res: Response): Promise<void> => {

    console.log('Route hit backend');

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
         res.status(400).json({ errors: errors.array() });
         return
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
         res.status(400).json({ error: 'Email and password are required' });
         return
    }

    try {
        const user: IUser | null = await User.findOne({ email });

        if (!user) {
             res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
             return
        }
        
        if (user) {       
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                 res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
                 return
            }

            const payload = {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            };
            console.log('config.jwtSecret: ', config.jwtSecret)

            const token = jwt.sign(
                payload,
                config.jwtSecret as string,
                { expiresIn: 360000 }, 
            );

            // Send success response
             res.json({token, user}) 
             return
        }
    } catch (err) {
        console.error('Error in /api/auth/login route:', err);
         res.status(500).json({ error: 'Server error' });
         return
    }
});

// Reset password
/**
 * @swagger
 * /request-password-reset:
 *   post:
 *     summary: Request a password reset
 *     description: Sends a password reset email to the user if the email exists in the database.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user requesting the password reset.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Successfully sent password reset email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Password reset email sent."
 *       404:
 *         description: User email not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "User email not found."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Internal server error"
 */
router.post('/request-password-reset', async (req: Request, res: Response) => {
    console.log('in backend Auth.ts/request-password-reset')

    const { email } = req.body;
    console.log('email: ', email)
    const user = await User.findOne({ email });
  
    if (!user) {
       res.status(404).json({ message: 'User email not found.' });
    }
  
    const token = crypto.randomBytes(32).toString('hex'); // Generate token

    if (user){
        user.resetToken = token; // Save token to user record
        user.resetTokenExpiration = new Date(Date.now() + 25200000); // 1 hour expiration
        await user.save();

        console.log('after user token reset')
    
        await sendResetEmailUser(email, token); // Function to send email
        res.status(200).json({ message: 'Password reset email sent.' });
   }
  });

// Password reset
/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using a valid reset token and a new password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The password reset token sent to the user's email.
 *                 example: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
 *               newPassword:
 *                 type: string
 *                 description: The new password to set for the user. Must be at least 6 characters long.
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Successfully reset the password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Password has been reset successfully."
 *       400:
 *         description: Invalid request parameters or token issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid token format."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Internal server error"
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;

    console.log('in BACKEND Auth.ts  /reset-password', token, newPassword );

    const isValidTokenFormat = (token: string) => /^[a-f0-9]{64}$/.test(token);
    if (!isValidTokenFormat(token)) {
        res.status(400).json({ message: 'Invalid token format.' });
        return 
    }

    const user = await User.findOne({ resetToken: token });
    if (!user) {
        res.status(400).json({ message: 'Token not found.' });
        return 
    }

    // Validate new password length
    if (newPassword.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        return 
    }

    // Check if the token is expired
    if (!user.resetTokenExpiration || !(user.resetTokenExpiration instanceof Date) || user.resetTokenExpiration.getTime() < Date.now()) {
        res.status(400).json({ message: 'Invalid or expired token.' });
        return 
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined; // Clear the token
    user.resetTokenExpiration = undefined; // Clear expiration

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
    res.end();
    return 
});

export default router;