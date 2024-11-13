import express, { NextFunction, Request, Response } from 'express';
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

//   router.get('/reset-password', (req, res) => {
//     res.status(200).json({ message: 'Welcome to the API!' });
//   });  

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

// Reset password
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
 * @summary Create a new member and send verification email.
 * @route POST /members
 * @param {Object} req.body - The member data.
 * @param {string} req.body.firstName - The first name of the member.
 * @param {string} req.body.lastName - The last name of the member.
 * @param {string} req.body.email - The email address of the member.
 * @param {string} req.body.password - The password for the member.
 * @param {string} req.body.membername - The username of the member.
 * @returns {Object} 201 - The created member object.
 * @returns {Error} 400 - User already exists or validation errors.
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
 * @summary Get all members.
 * @route GET /members
 * @returns {Array<IMember>} 200 - An array of member objects.
 * @returns {Error} 500 - Internal server error.
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
 * @summary Get a member by ID.
 * @route GET /members/{memberId}
 * @param {string} memberId.path.required - The ID of the member.
 * @returns {IMember} 200 - The member object.
 * @returns {Error} 404 - Member not found.
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
 * @summary Update a member by ID.
 * @route PUT /members/{memberId}
 * @param {string} memberId.path.required - The ID of the member to update.
 * @param {Object} req.body - The updated member data.
 * @returns {IMember} 200 - The updated member object.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 400 - Validation error.authenticateJWT,
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
 * @summary Delete a member by ID.
 * @route DELETE /members/{memberId}
 * @param {string} memberId.path.required - The ID of the member to delete.
 * @returns {Object} 200 - Confirmation message.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 500 - Internal server error.
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
 * @summary Create attendance record for a member.
 * @route POST /members/{memberId}/attendance
 * @param {string} memberId.path.required - The ID of the member.
 * @param {Object} req.body - Attendance data.
 * @param {string} req.body.date - The date of attendance.
 * @param {boolean} req.body.attended - Attendance status.
 * @returns {Object} 201 - The created attendance record.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 400 - Validation error.
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
 * @summary Get attendance record for a member.
 * @route GET /members/{memberId}/attendance
 * @param {string} memberId.path.required - The ID of the member.
 * @returns {Array} 200 - The attendance records for the member.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 500 - Internal server error.
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
 * @summary Update attendance record for a member.
 * @route PUT /members/{memberId}/attendance/{recordId}
 * @param {string} memberId.path.required - The ID of the member.
 * @param {string} recordId.path.required - The ID of the attendance record.
 * @param {Object} req.body - Updated attendance data.
 * @param {string} req.body.date - The updated date of attendance.
 * @param {boolean} req.body.attended - Updated attendance status.
 * @returns {Object} 200 - The updated attendance record.
 * @returns {Error} 404 - Member or attendance record not found.
 * @returns {Error} 400 - Validation error.
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
 * @summary Delete attendance record for a member.
 * @route DELETE /members/{memberId}/attendance/{recordId}
 * @param {string} memberId.path.required - The ID of the member.
 * @param {string} recordId.path.required - The ID of the attendance record.
 * @returns {Object} 200 - Confirmation message.
 * @returns {Error} 404 - Member or attendance record not found.
 * @returns {Error} 500 - Internal server error.
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
 * @summary Create tithe record for a member.
 * @route POST /members/{memberId}/tithe
 * @param {string} memberId.path.required - The ID of the member.
 * @param {Object} req.body - tithe data.
 * @param {string} req.body.date - The date of tithe.
 * @param {boolean} req.body.amount - Amount quantity.
 * @returns {Object} 201 - The created tithe record.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 400 - Validation error.
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
* @summary Get tithe record for a member.
* @route GET /members/{memberId}/tithes
* @param {string} memberId.path.required - The ID of the member.
* @returns {Array} 200 - The tithes records for the member.
* @returns {Error} 404 - Member not found.
* @returns {Error} 500 - Internal server error.
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
* @summary Update tithe record for a member.
* @route PUT /members/{memberId}/tithes/{recordId}
* @param {string} memberId.path.required - The ID of the member.
* @param {string} recordId.path.required - The ID of the tithe record.
* @param {Object} req.body - Updated tithe data.
* @param {string} req.body.date - The updated date of tithe.
* @param {boolean} req.body.tithes - Updated tithe status.
* @returns {Object} 200 - The updated tithe record.
* @returns {Error} 404 - Member or tithe record not found.
* @returns {Error} 400 - Validation error.
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
* @summary Delete tithes record for a member.
* @route DELETE /members/{memberId}/tithes/{recordId}
* @param {string} memberId.path.required - The ID of the member.
* @param {string} recordId.path.required - The ID of the tithes record.
* @returns {Object} 200 - Confirmation message.
* @returns {Error} 404 - Member or tithe record not found.
* @returns {Error} 500 - Internal server error.
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
 * @summary Create offering record for a member.
 * @route POST /members/{memberId}/offering
 * @param {string} memberId.path.required - The ID of the member.
 * @param {Object} req.body - offering data.
 * @param {string} req.body.date - The date of offering.
 * @param {boolean} req.body.amount - Amount quantity.
 * @returns {Object} 201 - The created offering record.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 400 - Validation error.
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
* @summary Get offerings record for a member.
* @route GET /members/{memberId}/offerings
* @param {string} memberId.path.required - The ID of the member.
* @returns {Array} 200 - The offerings records for the member.
* @returns {Error} 404 - Member not found.
* @returns {Error} 500 - Internal server error.
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
* @summary Update offerings record for a member.
* @route PUT /members/{memberId}/offerings/{recordId}
* @param {string} memberId.path.required - The ID of the member.
* @param {string} recordId.path.required - The ID of the offerings record.
* @param {Object} req.body - Updated offerings data.
* @param {string} req.body.date - The updated date of offerings.
* @param {boolean} req.body.attended - Updated offerings status.
* @returns {Object} 200 - The updated offerings record.
* @returns {Error} 404 - Member or offerings record not found.
* @returns {Error} 400 - Validation error.
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
* @summary Delete offerings record for a member.
* @route DELETE /members/{memberId}/offerings/{recordId}
* @param {string} memberId.path.required - The ID of the member.
* @param {string} recordId.path.required - The ID of the offerings record.
* @returns {Object} 200 - Confirmation message.
* @returns {Error} 404 - Member or offerings record not found.
* @returns {Error} 500 - Internal server error.
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



























































