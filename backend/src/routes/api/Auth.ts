import express from 'express';
import { Request, Response } from 'express';

// import expressValidator from 'express-validator';
// const { check, validationResult } = expressValidator;
import { check, validationResult } from 'express-validator';

import jwt from 'jsonwebtoken';

import config from '../../utils/config.js';
import { User, IUser } from '../../../models/Users.js';

import { sendResetEmail } from '../../utils/email.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req: Request, res: Response): Promise<void> => {

    console.log('Route hit backend');

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

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
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            };

            const token = jwt.sign(
                payload,
                config.jwtSecret as string,
                { expiresIn: 360000 }, 
            );

            // Send success response
            res.json({token, user}) 
        }
    } catch (err) {
        console.error('Error in /api/auth/login route:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset password
router.post('/request-password-reset', async (req: Request, res: Response) => {
    console.log('in backend /request-password-reset')

    const { email } = req.body;
    console.log('email: ', email)
    const user = await User.findOne({ email });
  
    if (!user) {
       res.status(404).json({ message: 'Email not found.' });
    }
  
    const token = crypto.randomBytes(32).toString('hex'); // Generate token

    if (user){
        user.resetToken = token; // Save token to user record
        user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour expiration
        await user.save();

        console.log('after user token reset')
    
        await sendResetEmail(email, token); // Function to send email
        res.status(200).json({ message: 'Password reset email sent.' });
   }
  });

// Password reset
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
  
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
  
    if (!user) {
      res.status(400).json({ message: 'Invalid or expired token.' });
    }
  
    // Validate new password (e.g., length, complexity)
    if (newPassword.length < 6) {
       res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
  
    // Hash the password
    const salt = await bcrypt.genSalt(10);

    if (user){
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetToken = undefined; // Clear the token
        user.resetTokenExpiration = undefined; // Clear expiration

        await user.save(); 
        res.status(200).json({ message: 'Password has been reset successfully.' });
    }
  });

export default router;




