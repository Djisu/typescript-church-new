"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = __importDefault(require("express-validator"));
const { check, validationResult } = express_validator_1.default;
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../utils/config"));
const Users_js_1 = require("../../../models/Users.js");
const email_1 = require("../../utils/email");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Route hit backend');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const user = yield Users_js_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        if (user) {
            const isMatch = yield user.comparePassword(password);
            if (!isMatch) {
                res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
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
            const token = jwt.sign(payload, config_1.default.jwtSecret, { expiresIn: 360000 });
            //console.log('tokenx: ', token)
            res.json({ token, user });
        }
    }
    catch (err) {
        console.error('Error in /api/auth route:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Reset password
router.post('/request-password-reset', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in backend /request-password-reset');
    const { email } = req.body;
    console.log('email: ', email);
    const user = yield Users_js_1.User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: 'Email not found.' });
    }
    const token = crypto_1.default.randomBytes(32).toString('hex'); // Generate token
    if (user) {
        user.resetToken = token; // Save token to user record
        user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour expiration
        yield user.save();
        console.log('after user token reset');
        yield (0, email_1.sendResetEmail)(email, token); // Function to send email
        res.status(200).json({ message: 'Password reset email sent.' });
    }
}));
// Password reset
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    const user = yield Users_js_1.User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!user) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
    // Validate new password (e.g., length, complexity)
    if (newPassword.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    // Hash the password
    const salt = yield bcrypt_1.default.genSalt(10);
    if (user) {
        user.password = yield bcrypt_1.default.hash(newPassword, salt);
        user.resetToken = undefined; // Clear the token
        user.resetTokenExpiration = undefined; // Clear expiration
        yield user.save();
        res.status(200).json({ message: 'Password has been reset successfully.' });
    }
}));
exports.default = router;
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
//# sourceMappingURL=Auth.js.map