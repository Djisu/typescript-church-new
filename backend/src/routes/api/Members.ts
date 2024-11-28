import express, { Router,   Request, Response} from 'express';
import { Member, IMember } from '../../../models/Members.js';
import nodemailer, { SendMailOptions, SentMessageInfo } from 'nodemailer';
import { check, validationResult } from 'express-validator';

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import jwt from 'jsonwebtoken';

import { sendResetEmailMember } from '../../utils/emailMember.js';
import authenticateJWT from '../../utils/authenticateJWT.js';

import config from '../../utils/config.js';
import dotenv from 'dotenv';
dotenv.config();

let frontendUrl = "" //process.env.FRONTEND_URL; // Access the environment variable

const emailPassword = process.env.EMAIL_PASS
const appPassword = process.env.APP_PASSWORD
const emailUser = process.env.EMAIL_USER
const port = process.env.PORT || 3001;

const nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'development'){
    frontendUrl = "http://localhost:5173";
} else if (nodeEnv === 'production'){
    frontendUrl = "https://typescript-church-new.onrender.com";
} else {
    console.log('Invalid node environment variable') //.slice()
}

const router = express.Router();

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: appPassword  //'YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD', 
    }
  });

/**
 * @swagger
 * /capture-phone:
 *   post:
 *     summary: Capture Phone Number
 *     description: Captures the member's phone number and logs attendance if consent is provided.
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consent:
 *                 type: boolean
 *                 description: User's consent to share their phone number.
 *                 example: true
 *               phoneNumber:
 *                 type: string
 *                 description: The member's phone number.
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Attendance recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Attendance recorded successfully"
 *       400:
 *         description: Consent required or invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Consent required"
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
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
// Endpoint to capture phone number
router.post('/capture-phone', async (req: Request, res: Response): Promise<any> => {
    const { consent, phoneNumber } = req.body;

    if (!consent) {
      return res.status(400).send('Consent required');
       
    }

    // Capture phone number logic here (replace with actual capture logic)
    console.log('Capturing phone number:', phoneNumber);

    // Check for phone number
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
        
    }

    // Find the member based on the phone number
    const member = await Member.findOne({ phone: phoneNumber });

    if (member) {
        // Update attendance record
        member.attendanceRecord.push({
            date: new Date(),
            attended: true,
        });
        await member.save();
        return res.status(200).send('Attendance recorded successfully');
        
    } else {
        return res.status(404).send('Member not found');
        
    }
});  
  
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Member login
 *     description: Authenticates a member and returns a JSON Web Token (JWT) if the credentials are valid.
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
 *                 description: The email of the member.
 *                 example: "member@example.com"
 *               password:
 *                 type: string
 *                 description: The password of the member (minimum 6 characters).
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successfully logged in and returned a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JSON Web Token for authenticated access.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique identifier of the member.
 *                       example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                     username:
 *                       type: string
 *                       description: The username of the member.
 *                       example: "memberUser"
 *                     email:
 *                       type: string
 *                       description: The email of the member.
 *                       example: "member@example.com"
 *                     role:
 *                       type: string
 *                       description: The role of the member.
 *                       example: "user"
 *       400:
 *         description: Bad request due to validation errors or invalid credentials.
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
 *         description: Internal server error.
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
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], async (req: Request, res: Response): Promise<void> => {

    console.log('Route member /login');

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const member: IMember | null = await Member.findOne({ email });

        if (!member) {
           res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
           return
        }
        if (!member.isVerified) {
            res.status(400).json({ errors: [{ msg: 'Please verify your email first' }] });
            return
        }
        
        if (member) {  
            console.log('member found!!')     
            const isMatch = await member.comparePassword(password);

            if (!isMatch) {
                res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
                return
            }
            console.log('password match!!')
           
            const payload = {
                member: {
                    id: member._id,
                    username: member.userName,
                    email: member.email,
                    role: member.role
                }
            };

           console.log('Payload before signing:', payload);

           console.log('config.jwtSecret: ', config.jwtSecret)

            const token = jwt.sign(
                payload,
                config.jwtSecret as string,
                { expiresIn: '1h' }, 
            );

            console.log('Generated token:', token);

            // Send success response
            console.log({token, member})
            res.json({token, member}) 
        }
    } catch (err) {
        console.error('Error in /api/auth/login route:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Request for Reset password
/**
 * @swagger
 * /request-password-reset:
 *   post:
 *     summary: Request a password reset
 *     description: Generates a password reset token and sends a reset email to the member if the email exists in the system.
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
 *                 description: The email of the member requesting the password reset.
 *                 example: "member@example.com"
 *     responses:
 *       200:
 *         description: Successfully sent the password reset email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: "Password reset email sent."
 *       404:
 *         description: Member email not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Member Email not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Server error"
 */
router.post('/request-password-reset', async (req: Request, res: Response) => {
    console.log('in backend Member.ts /request-password-reset')

    const { email } = req.body;
    console.log('email: ', email)
    const member = await Member.findOne({ email });
  
    if (!member) {
       res.status(404).json({ message: 'Member Email not found.' });
    }
  
    const token = crypto.randomBytes(32).toString('hex'); // Generate token

    console.log('token generated: ', token)

    if (member) {
        // Clear existing reset token and expiration if it exists
        if (member.resetToken) {
            member.resetToken = undefined; // Clear the existing token
            member.resetTokenExpiration = undefined; // Clear the existing expiration
        }
    console.log('after member token reset')
    
        // Generate a new token
        const token = crypto.randomBytes(32).toString('hex'); // Ensure to generate a new token
    
        // Assign the new token and set the expiration time
        member.resetToken = token; // Save token to member record
        member.resetTokenExpiration = new Date(Date.now() + 25200000); // 7 hours expiration
        await member.save();
    
        console.log('after member token reset');
    
        await sendResetEmailMember(email, token); // Function to send email
        res.status(200).json({ message: 'Password reset email sent.' });
    }
  });

// Password reset
/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset a member's password
 *     description: Validates a password reset token and updates the member's password if the token is valid and not expired.
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
 *                 description: The password reset token sent to the member's email.
 *                 example: "a1b2c3d4e5f67890123456789abcdefabcdefabcdefabcdefabcdefabcdef"
 *               newPassword:
 *                 type: string
 *                 description: The new password for the member (minimum 6 characters).
 *                 example: "newpassword123"
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
 *                   description: Confirmation message.
 *                   example: "Password has been reset successfully."
 *       400:
 *         description: Bad request due to invalid token or password criteria not met.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid token format."
 *       404:
 *         description: Token not found or member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Token not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Server error"
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
   // console.log('in Member.ts /reset-password')
    const { token, newPassword } = req.body;

    console.log('in BACKEND Member.ts  /reset-password', token, newPassword )

    const isValidTokenFormat = (token: string) => /^[a-f0-9]{64}$/.test(token); // Adjust regex based on token length
    if (!isValidTokenFormat(token)) {
        res.status(400).json({ message: 'Invalid token format.' });
        return
    }
  
    const memberCheck = await Member.findOne({ resetToken: token });
    if (!memberCheck) {    
        res.status(400).json({ message: 'Token not found.' });    
        return
    }
    //compare memberCheck to token
    if (memberCheck.resetToken !== token) {
        res.status(400).json({ message: 'Token does not match.' });
        return
    }
    console.log('after token check')
  
    const member = await Member.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
  
    if (!member) {
      res.status(400).json({ message: 'Invalid or expired token.' });
    }
    console.log('after member check')
  
    // Validate new password (e.g., length, complexity)
    if (newPassword.length < 6) {
       res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
  
    // Hash the password
    const salt = await bcrypt.genSalt(10);

    if (member){
        member.password = await bcrypt.hash(newPassword, salt);
        member.resetToken = undefined; 
        member.resetTokenExpiration = undefined; 

        await member.save(); 
        res.status(200).json({ message: 'Password has been reset successfully.' });
    }
  });


/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new member
 *     description: Registers a new member and sends a verification email to the provided email address.
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the member.
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The last name of the member.
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 description: The email address of the member.
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: The password for the member (minimum 6 characters).
 *                 example: "password123"
 *               userName:
 *                 type: string
 *                 description: The username for the member.
 *                 example: "johndoe"
 *               role:
 *                 type: string
 *                 description: The role assigned to the member.
 *                 example: "user"
 *               phone:
 *                 type: string
 *                 description: The phone number of the member.
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 description: The address of the member.
 *                 example: "123 Main St, Anytown, USA"
 *               membership_type:
 *                 type: string
 *                 description: The type of membership for the member.
 *                 example: "premium"
 *               status:
 *                 type: string
 *                 description: The current status of the member.
 *                 example: "pending approval"
 *               affiliated:
 *                 type: string
 *                 description: Any affiliations of the member.
 *                 example: "Some Organization"
 *               joinedDate:
 *                 type: string
 *                 format: date-time
 *                 description: The date the member joined.
 *                 example: "2024-01-01T00:00:00Z"
 *     responses:
 *       201:
 *         description: Successfully created the member and sent a verification email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: "User not registered yet. Check your email for verification."
 *       400:
 *         description: Bad request due to validation errors or existing user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "User already exists"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Error sending email"
 */
router.post('/create', async (req: Request, res: Response): Promise<void> => {
    console.log('in create member ');
    console.log('Incoming request body:', req.body);
    console.log('port:', port)

    try {
        let { firstName, lastName, email, password, userName, role } = req.body;

        // Check if the user already exists
        const existingUser = await Member.findOne({ email });
        if (existingUser) {
            console.log('User already exists')
             res.status(400).json({ message: 'User already exists' });
             return
        }

        console.log('about to generate verification token')
        // Create a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('hashedPassword generated')

        // Create initial member data
        const initialMemberData = {
            userName,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            phone: req.body.phone || null,
            address: req.body.address || null,  
            membership_type: req.body.membership_type || null,            
            status: req.body.status || 'pending approval',
            affiliated: req.body.affiliated || null,
            joinedDate: req.body.joinedDate || new Date(),
            verificationToken,
            isVerified: false,
        };

        // Create and save the new member
        const newMember = new Member(initialMemberData);
        await newMember.save();

        console.log('new member created')

        // Send verification email frontendUrl
        const verificationLink = `${frontendUrl}/verify-email/${verificationToken}?env=${nodeEnv}`;

        type SendMailOptions = any;
        const mailOptions: SendMailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@example.com',
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking on the following link: ${verificationLink}`,
            html: `<p>Please verify your email by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p>`,
        };

        console.log('about to send verification email')

        // Send the email
        type SentMessageInfo = any
        transport.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent successfully:', info);

            return res.status(201).json({ message: 'User not registered yet. Check your email for verification.' });
           
        });
    } catch (error: any) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve all members
 *     description: Fetches a list of all registered members from the database.
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of members.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the member.
 *                     example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                   firstName:
 *                     type: string
 *                     description: The first name of the member.
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     description: The last name of the member.
 *                     example: "Doe"
 *                   email:
 *                     type: string
 *                     description: The email address of the member.
 *                     example: "john.doe@example.com"
 *                   userName:
 *                     type: string
 *                     description: The username of the member.
 *                     example: "johndoe"
 *                   role:
 *                     type: string
 *                     description: The role assigned to the member.
 *                     example: "user"
 *                   status:
 *                     type: string
 *                     description: The current status of the member.
 *                     example: "active"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Server error"
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const members: IMember[] = await Member.find({});
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{memberId}:
 *   get:
 *     summary: Retrieve a specific member by ID
 *     description: Fetches a member's details based on the provided member ID.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: Successfully retrieved the member's details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the member.
 *                   example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                 firstName:
 *                   type: string
 *                   description: The first name of the member.
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   description: The last name of the member.
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   description: The email address of the member.
 *                   example: "john.doe@example.com"
 *                 userName:
 *                   type: string
 *                   description: The username of the member.
 *                   example: "johndoe"
 *                 role:
 *                   type: string
 *                   description: The role assigned to the member.
 *                   example: "user"
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.get('/:memberId', async (req: Request, res: Response): Promise<void> => {
    try {
        const member: IMember | null = await Member.findById(req.params.memberId);
        if (!member) {
             res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{memberId}:
 *   put:
 *     summary: Update a member's information
 *     description: Updates the details of a specific member identified by member ID. Requires authentication and a role check.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member to be updated.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the member.
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The last name of the member.
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 description: The email address of the member.
 *                 example: "john.doe@example.com"
 *               userName:
 *                 type: string
 *                 description: The username of the member.
 *                 example: "johndoe"
 *               role:
 *                 type: string
 *                 description: The role assigned to the member. Must be 'Member' to authorize the update.
 *                 example: "Member"
 *               phone:
 *                 type: string
 *                 description: The phone number of the member.
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 description: The address of the member.
 *                 example: "123 Main St, Anytown, USA"
 *               status:
 *                 type: string
 *                 description: The current status of the member.
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Successfully updated the member's information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the member.
 *                   example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                 firstName:
 *                   type: string
 *                   description: The updated first name of the member.
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   description: The updated last name of the member.
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   description: The updated email address of the member.
 *                   example: "john.doe@example.com"
 *                 userName:
 *                   type: string
 *                   description: The updated username of the member.
 *                   example: "johndoe"
 *                 role:
 *                   type: string
 *                   description: The updated role assigned to the member.
 *                   example: "Member"
 *       403:
 *         description: Forbidden if the user is not authorized to perform the update.
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the member was not found.
 *                   example: "Member not found"
 *       400:
 *         description: Bad request due to validation errors or other issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Validation failed"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.put('/:memberId', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
    console.log('backend in update member');
    console.log('Incoming request body:', req.body);
    console.log('req.params.memberId:', req.params.memberId);

    // Example role check
    if (req.body.role !== 'Member') {
        console.log('member role is not Member');
        res.sendStatus(403); // Forbidden if the user is not authorized
        return;
    }

    console.log('member role is Member');
    try {
        console.log('about to check for member existence');
        
        // First, check if the member exists
        const existingMember: IMember | null = await Member.findById(req.params.memberId);
        
        console.log('after checking for member existence', existingMember);
        
        if (!existingMember) {
            res.status(404).json({ message: 'Member not found' });
            return; // Exit if the member doesn't exist
        }

        // Now proceed to update the member
        console.log('about to update member');
        const updatedMember: IMember | null = await Member.findByIdAndUpdate(
            req.params.memberId,
            req.body,
            { new: true, runValidators: true }
        );

        console.log('Updated member:', updatedMember);
        res.json(updatedMember);
    } catch (error: any) {
        console.error('Update error:', error); // Log the error
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{memberId}:
 *   delete:
 *     summary: Delete a member by ID
 *     description: Deletes a specific member identified by the member ID from the database.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member to be deleted.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: Successfully deleted the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating the member was deleted.
 *                   example: "Member deleted"
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.delete('/:memberId', async (req: Request, res: Response): Promise<void> => {
    try {
        const member: IMember | null = await Member.findByIdAndDelete(req.params.memberId);
        if (!member) {
             res.status(404).json({ message: 'Member not found' });
        }
        res.json({ message: 'Member deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


/**
 * @swagger
 * /{memberId}/attendance:
 *   post:
 *     summary: Record attendance for a member
 *     description: Adds an attendance record for a specific member identified by their member ID.
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member for whom attendance is being recorded.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the attendance record.
 *                 example: "2024-11-16"
 *               attended:
 *                 type: boolean
 *                 description: Indicates whether the member attended on the specified date.
 *                 example: true
 *     responses:
 *       201:
 *         description: Successfully recorded the attendance for the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date of attendance.
 *                   example: "2024-11-16"
 *                 attended:
 *                   type: boolean
 *                   description: Attendance status.
 *                   example: true
 *       400:
 *         description: Bad request due to invalid member ID format or other validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *                   example: "Invalid member ID format"
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.post('/:memberId/attendance', async (req: Request, res: Response): Promise<void> => {
    console.log('in router.post(/:memberId/attendance')
    try {
        const { memberId } = req.params;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
           res.status(400).json({ message: 'Invalid member ID format' });
        }
        const { date, attended } = req.body;

        const member: IMember | null = await Member.findById(memberId);
        if (!member) {
             res.status(404).json({ message: 'Member not found' });
        }
        if (member) {       
            member.attendanceRecord.push({ date, attended });
            await member.save();

            res.status(201).json(member.attendanceRecord[member.attendanceRecord.length - 1]);
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{memberId}/attendance:
 *   get:
 *     summary: Retrieve attendance records for a member
 *     description: Fetches the attendance records for a specific member identified by their member ID.
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose attendance records are being retrieved.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: Successfully retrieved the attendance records for the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date of attendance.
 *                     example: "2024-11-16"
 *                   attended:
 *                     type: boolean
 *                     description: Indicates whether the member attended on the specified date.
 *                     example: true
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.get('/:memberId/attendance', async (req: Request, res: Response): Promise<void> => {
    try {
        const { memberId } = req.params;
        const member: IMember | null = await Member.findById(memberId);

        if (!member) {
             res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
             res.json(member.attendanceRecord);
        }      
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{memberId}/attendance/{recordId}:
 *   put:
 *     summary: Update a member's attendance record
 *     description: Updates a specific attendance record for a member identified by their member ID and record ID.
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose attendance record is being updated.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *       - in: path
 *         name: recordId
 *         required: true
 *         description: The unique identifier of the attendance record to be updated (formatted as a timestamp).
 *         schema:
 *           type: string
 *           example: "1637280000000"  # Example timestamp in milliseconds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The updated date of the attendance record.
 *                 example: "2024-11-16"
 *               attended:
 *                 type: boolean
 *                 description: Indicates whether the member attended on the specified date.
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated the attendance record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The updated date of attendance.
 *                   example: "2024-11-16"
 *                 attended:
 *                   type: boolean
 *                   description: Updated attendance status.
 *                   example: true
 *       404:
 *         description: Member or attendance record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member or record was not found.
 *                   example: "Member not found" or "Attendance record not found"
 *       400:
 *         description: Bad request due to validation errors or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *                   example: "Invalid input"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.put('/:memberId/attendance/:recordId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { memberId, recordId } = req.params;
        const { date, attended } = req.body;

        const member: IMember | null = await Member.findById(memberId);
        if (!member) {
             res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
            if (!record) {
                res.status(404).json({ message: 'Attendance record not found' });
            }
            if (record){
                record.date = date;
                record.attended = attended;
            }
            await member.save();

            res.json(record);
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /{memberId}/attendance/{recordId}:
 *   delete:
 *     summary: Delete a member's attendance record
 *     description: Deletes a specific attendance record for a member identified by their member ID and record ID.
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose attendance record is being deleted.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *       - in: path
 *         name: recordId
 *         required: true
 *         description: The unique identifier of the attendance record to be deleted (formatted as a timestamp).
 *         schema:
 *           type: string
 *           example: "1637280000000"  # Example timestamp in milliseconds
 *     responses:
 *       200:
 *         description: Successfully deleted the attendance record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating the record was deleted.
 *                   example: "Attendance record deleted"
 *       404:
 *         description: Member or attendance record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member or record was not found.
 *                   example: "Member not found" or "Attendance record not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.delete('/:memberId/attendance/:recordId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { memberId, recordId } = req.params;

        const member: IMember | null = await Member.findById(memberId);
        if (!member) {
             res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            const recordIndex = member.attendanceRecord.findIndex(r => r.date.getTime() === Number(recordId));
            if (recordIndex === -1) {
                res.status(404).json({ message: 'Attendance record not found' });
            }

            member.attendanceRecord.splice(recordIndex, 1);
            await member.save();

            res.json({ message: 'Attendance record deleted' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Additional routes for tithes and offerings can follow the same pattern.
// Ensure to add TSDoc comments similar to the examples above for those routes as well.

// Tithe
/**
 * @swagger
 * /{memberId}/tithes:
 *   post:
 *     summary: Record a tithe for a member
 *     description: Adds a tithe record for a specific member identified by their member ID.
 *     tags: [Tithes]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member for whom the tithe is being recorded.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the tithe record.
 *                 example: "2024-11-16"
 *               amount:
 *                 type: number
 *                 description: The amount of the tithe.
 *                 example: 100.00
 *     responses:
 *       201:
 *         description: Successfully recorded the tithe for the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date of the recorded tithe.
 *                   example: "2024-11-16"
 *                 amount:
 *                   type: number
 *                   description: The amount of the recorded tithe.
 *                   example: 100.00
 *       400:
 *         description: Bad request due to invalid member ID format or other validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *                   example: "Invalid member ID format"
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.post('/:memberId/tithes', async (req: Request, res: Response): Promise<void> => {
  console.log('in router.post(/:memberId/tithes')
  try {
      const { memberId } = req.params;
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
         res.status(400).json({ message: 'Invalid member ID format' });
      }
      const { date, amount } = req.body;

      const member: IMember | null = await Member.findById(memberId);
      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
        member.tithes.push({ date, amount });
        await member.save();

        res.status(201).json(member.tithes[member.tithes.length - 1]);
      }
  } catch (error: any) {
      res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /{memberId}/tithes:
 *   get:
 *     summary: Retrieve tithes for a member
 *     description: Fetches the tithes records for a specific member identified by their member ID.
 *     tags: [Tithes]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose tithes are being retrieved.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: Successfully retrieved the tithes records for the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date of the tithe.
 *                     example: "2024-11-16"
 *                   amount:
 *                     type: number
 *                     description: The amount of the tithe.
 *                     example: 100.00
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.get('/:memberId/tithes', async (req: Request, res: Response): Promise<void> => {
  try {
      const { memberId } = req.params;
      const member: IMember | null = await Member.findById(memberId);

      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
        res.json(member.tithes);
      }     
  } catch (error: any) {
      res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /{memberId}/tithes/{recordId}:
 *   put:
 *     summary: Update a member's tithe record
 *     description: Updates a specific tithe record for a member identified by their member ID and record ID.
 *     tags: [Tithes]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose tithe record is being updated.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *       - in: path
 *         name: recordId
 *         required: true
 *         description: The unique identifier of the tithe record to be updated (formatted as a timestamp).
 *         schema:
 *           type: string
 *           example: "1637280000000"  # Example timestamp in milliseconds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The updated date of the tithe record.
 *                 example: "2024-11-16"
 *               amount:
 *                 type: number
 *                 description: The updated amount of the tithe.
 *                 example: 150.00
 *     responses:
 *       200:
 *         description: Successfully updated the tithe record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The updated date of the tithe.
 *                   example: "2024-11-16"
 *                 amount:
 *                   type: number
 *                   description: The updated amount of the tithe.
 *                   example: 150.00
 *       404:
 *         description: Member or tithe record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member or record was not found.
 *                   example: "Member not found" or "Tithe record not found"
 *       400:
 *         description: Bad request due to validation errors or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *                   example: "Invalid input"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.put('/:memberId/tithes/:recordId', async (req: Request, res: Response): Promise<void> => {
  try {
      const { memberId, recordId } = req.params;
      const { date, amount } = req.body;

      const member: IMember | null = await Member.findById(memberId);
      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
        const record = member.tithes.find(r => r.date.getTime() === Number(recordId));
      
        if (!record) {
            res.status(404).json({ message: 'Attendance record not found' });
        }
        if (record) {
            record.date = date;
            record.amount = amount;
            await member.save();

            res.json(record);
        }
      }
  } catch (error: any) {
      res.status(400).json({ message: error.message });
  }
});


/**
 * @swagger
 * /{memberId}/tithes/{recordId}:
 *   delete:
 *     summary: Delete a member's tithe record
 *     description: Deletes a specific tithe record for a member identified by their member ID and record ID.
 *     tags: [Tithes]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose tithe record is being deleted.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *       - in: path
 *         name: recordId
 *         required: true
 *         description: The unique identifier of the tithe record to be deleted (formatted as a timestamp).
 *         schema:
 *           type: string
 *           example: "1637280000000"  # Example timestamp in milliseconds
 *     responses:
 *       200:
 *         description: Successfully deleted the tithe record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating the record was deleted.
 *                   example: "Tithe record deleted"
 *       404:
 *         description: Member or tithe record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member or record was not found.
 *                   example: "Member not found" or "Tithe record not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.delete('/:memberId/tithes/:recordId', async (req: Request, res: Response): Promise<void> => {
  try {
      const { memberId, recordId } = req.params;

      const member: IMember | null = await Member.findById(memberId);
      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
            const recordIndex = member.tithes.findIndex(r => r.date.getTime() === Number(recordId));
            if (recordIndex === -1) {
                res.status(404).json({ message: 'Tithe record not found' });
            }

            member.tithes.splice(recordIndex, 1);
            await member.save();

            res.json({ message: 'Tithe record deleted' });
       }
  } catch (error: any) {
      res.status(500).json({ message: error.message });
  }
});

// Offerings
/**
 * @swagger
 * /{memberId}/offerings:
 *   post:
 *     summary: Record an offering for a member
 *     description: Adds an offering record for a specific member identified by their member ID.
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member for whom the offering is being recorded.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the offering record.
 *                 example: "2024-11-16"
 *               amount:
 *                 type: number
 *                 description: The amount of the offering.
 *                 example: 100.00
 *     responses:
 *       201:
 *         description: Successfully recorded the offering for the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date of the recorded offering.
 *                   example: "2024-11-16"
 *                 amount:
 *                   type: number
 *                   description: The amount of the recorded offering.
 *                   example: 100.00
 *       400:
 *         description: Bad request due to invalid member ID format or other validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *                   example: "Invalid member ID format"
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.post('/:memberId/offerings', async (req: Request, res: Response): Promise<void> => {
  console.log('in router.post(/:memberId/offerings')
  try {
      const { memberId } = req.params;
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
         res.status(400).json({ message: 'Invalid member ID format' });
      }
      const { date, amount } = req.body;

      const member: IMember | null = await Member.findById(memberId);
      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
            member.offerings.push({ date, amount });
            await member.save();

            res.status(201).json(member.tithes[member.offerings.length - 1]);
      }
  } catch (error: any) {
      res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /{memberId}/offerings:
 *   get:
 *     summary: Retrieve offerings for a member
 *     description: Fetches the offerings records for a specific member identified by their member ID.
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose offerings are being retrieved.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: Successfully retrieved the offerings records for the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date of the offering.
 *                     example: "2024-11-16"
 *                   amount:
 *                     type: number
 *                     description: The amount of the offering.
 *                     example: 100.00
 *       404:
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member was not found.
 *                   example: "Member not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.get('/:memberId/offerings', async (req: Request, res: Response): Promise<void> => {
  try {
      const { memberId } = req.params;
      const member: IMember | null = await Member.findById(memberId);

      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
         res.json(member.offerings);
      }   
  } catch (error: any) {
      res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /{memberId}/offerings/{recordId}:
 *   put:
 *     summary: Update a member's offering record
 *     description: Updates a specific offering record for a member identified by their member ID and record ID.
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose offering record is being updated.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *       - in: path
 *         name: recordId
 *         required: true
 *         description: The unique identifier of the offering record to be updated (formatted as a timestamp).
 *         schema:
 *           type: string
 *           example: "1637280000000"  # Example timestamp in milliseconds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The updated date of the offering record.
 *                 example: "2024-11-16"
 *               amount:
 *                 type: number
 *                 description: The updated amount of the offering.
 *                 example: 150.00
 *     responses:
 *       200:
 *         description: Successfully updated the offering record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The updated date of the offering.
 *                   example: "2024-11-16"
 *                 amount:
 *                   type: number
 *                   description: The updated amount of the offering.
 *                   example: 150.00
 *       404:
 *         description: Member or offering record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member or record was not found.
 *                   example: "Member not found" or "Offering record not found"
 *       400:
 *         description: Bad request due to validation errors or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *                   example: "Invalid input"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.put('/:memberId/offerings/:recordId', async (req: Request, res: Response): Promise<void> => {
  try {
      const { memberId, recordId } = req.params;
      const { date, amount } = req.body;

      const member: IMember | null = await Member.findById(memberId);
      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
            const record = member.offerings.find(r => r.date.getTime() === Number(recordId));
            if (!record) {
                res.status(404).json({ message: 'Offering record not found' });
            }
            if (record) {
                record.date = date;
                record.amount = amount;
                await member.save();

                res.json(record);
            }
      }
  } catch (error: any) {
      res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /{memberId}/offerings/{recordId}:
 *   delete:
 *     summary: Delete a member's offering record
 *     description: Deletes a specific offering record for a member identified by their member ID and record ID.
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: The unique identifier of the member whose offering record is being deleted.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *       - in: path
 *         name: recordId
 *         required: true
 *         description: The unique identifier of the offering record to be deleted (formatted as a timestamp).
 *         schema:
 *           type: string
 *           example: "1637280000000"  # Example timestamp in milliseconds
 *     responses:
 *       200:
 *         description: Successfully deleted the offering record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating the record was deleted.
 *                   example: "Offering record deleted"
 *       404:
 *         description: Member or offering record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the member or record was not found.
 *                   example: "Member not found" or "Offering record not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Server error"
 */
router.delete('/:memberId/offerings/:recordId', async (req: Request, res: Response): Promise<void> => {
  try {
      const { memberId, recordId } = req.params;

      const member: IMember | null = await Member.findById(memberId);
      if (!member) {
           res.status(404).json({ message: 'Member not found' });
      }
      if (member) {
        const recordIndex = member.offerings.findIndex(r => r.date.getTime() === Number(recordId));
        if (recordIndex === -1) {
            res.status(404).json({ message: 'Offerings record not found' });
        }

        member.offerings.splice(recordIndex, 1);
        await member.save();

        res.json({ message: 'Offering record deleted' });
      }
  } catch (error: any) {
      res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /verify/{token}:
 *   get:
 *     summary: Verify a user's email
 *     description: Validates the provided verification token and updates the member's status to verified.
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The verification token sent to the user for email verification.
 *         schema:
 *           type: string
 *           example: "abc123verificationtoken"
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating successful verification.
 *                   example: "Email verified successfully!"
 *       404:
 *         description: Invalid verification token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the token is invalid.
 *                   example: "Invalid verification token"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "Internal Server Error"
 */
router.get('/verify/:token', async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;

    console.log('in verify/:token')

    try {
        // Find the member by verification token
        const member = await Member.findOne({ verificationToken: token });
        if (!member) {
            res.status(404).json({ message: 'Invalid verification token' });
            return
        }

        // Update member status to verified
        member.status = 'verified'; // or whatever your verified status is
        member.verificationToken = undefined; // Clear the token
        member.isVerified = true; // Set the isVerified flag to true
        await member.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;



























































