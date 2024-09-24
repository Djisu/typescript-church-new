import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import config from '../../utils/config';
import { User, IUser } from '../../../models/Users.js';

import { sendResetEmail } from '../../utils/email';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req: Request, res: Response) => {

    console.log('Route hit backend');

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    

    try {
        const user: IUser | null = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
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

        //console.log('payload: ', payload)config.jwtSecret,

        const token = jwt.sign(
            payload,
            config.jwtSecret as jwt.Secret,
            { expiresIn: 360000 }, 

            // (err, token) => {
            //     if (err) throw err;                         
            // }
        );
        //console.log('tokenx: ', token)
        res.json({token, user}) 
    } catch (err) {
        console.error('Error in /api/auth route:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset password
router.post('/request-password-reset', async (req: Request, res: Response) => {
    console.log('in backend /request-password-reset')

    const { email } = req.body;
    console.log('email: ', email)
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: 'Email not found.' });
    }
  
    const token = crypto.randomBytes(32).toString('hex'); // Generate token
    user.resetToken = token; // Save token to user record
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour expiration
    await user.save();

    console.log('after user token reset')
  
    await sendResetEmail(email, token); // Function to send email
     res.status(200).json({ message: 'Password reset email sent.' });
  });

// Password reset
router.post('/reset-password', async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
  
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
  
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
  
    // Validate new password (e.g., length, complexity)
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
  
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);



    user.resetToken = undefined; // Clear the token
    user.resetTokenExpiration = undefined; // Clear expiration
    await user.save();
  
    res.status(200).json({ message: 'Password has been reset successfully.' });
  });

export default router;




// import express, { Request, Response } from 'express';
// import { Document, Schema, model, ObjectId } from 'mongoose';
// import jwt from 'jsonwebtoken';
// import config from '../../utils/config';

// import usersData from '../../usersData';
// import { check, validationResult } from 'express-validator';
// import bcrypt from 'bcrypt';

// import { User, IUser, UserSchema } from '../../../models/Users.js';

// const router = express.Router();

// router.post('/auth', [
//     check('email', 'Please include a valid email').isEmail(),
//     check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
//   ], async (req: Request, res: Response) => {
//     console.log('Route hit');
//       const errors = validationResult(req);
  
//       console.log('in login');
  
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       } 
  
//       const { email, password } = req.body;
  
//       console.log('email, password: ', email, password);
  
//       try {
//         // Request user from the database by using the user's email
//         let user: IUser  | null = await User.findOne({ email });
  
//         //if (user){
//           console.log('user=== ', user)
//         //}
  
//         if (!user) {
//           return res
//             .status(400)
//             .json({ errors: [{ msg: 'Invalid Credentials' }] });
//         }
  
//         // Compare user provided password to the user's password stored in the database
//         //const isMatch = await user.comparePassword(password);
//         const isMatch = await UserSchema.methods.comparePassword.call(user, password);
  
//         console.log('isMatch is : ', isMatch)
  
//         if (!isMatch) {
//           return res
//             .status(400)
//             .json({ errors: [{ msg: 'Invalid Credentials' }] });
//         }
  
//         console.log("in auth router post user:", user);
  
//         // export interface IUser extends Document {
//         //   _id: string;
//         //   username: string;
//         //   email: string;
//         //   password: string;
//         //   role: string;
//         //   avatar?: string;
//         //   token?: string | null;
//         // }
  
//         //Return jsonwebtoken
//         const payload = {
//           user: {
//             id: user._id,
//             username: user.username,
//             email: user.email,
//             role: user.role,
//             avatar: user.avatar
//           }
//         };
//         jwt.sign(
//           payload,
//           config.jwtSecret,
//           { expiresIn: 360000 },
//           (err, token) => {
//             if (err) throw err;
  
//             res.json({ token });
//           }
//         );
//       } catch (err: any) {
//         console.error('Error in /users/login route:', err);
//       res.status(500).json({ error: 'Internal server error' });
//       }
//     }
//   );
  
  
//   async function authenticateUser(email: string, password: string): Promise<IUser | null> {
//      console.log('in authenticateUser: ', email)
  
//     const user = await User.findOne({ email });
  
//     if (!user) {
//       return null;
//     }
  
//     if (!(await user.comparePassword(password))) {
//       return null;
//     }
  
//     return user;
//   }
  
//   export default router;