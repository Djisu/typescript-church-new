import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import config from '../../utils/config';
import { User, IUser } from '../../../models/Users.js';

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