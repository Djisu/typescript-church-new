var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { Member } from '../../../models/Members.js';
//import nodemailer, { SendMailOptions, SentMessageInfo } from 'nodemailer';
//import  nodemailer, { createTransport, SendMailOptions, SentMessageInfo } from 'nodemailer';
import nodemailer from 'nodemailer';
import { check, validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../../utils/config.js';
import { sendResetEmail } from '../../utils/email.js';
import dotenv from 'dotenv';
dotenv.config();
const frontendUrl = process.env.FRONTEND_URL; // Access the environment variable
const emailPassword = process.env.EMAIL_PASS;
const appPassword = process.env.APP_PASSWORD;
const emailUser = process.env.EMAIL_USER;
const router = express.Router();
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: appPassword //'YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD'
    }
});
// const transport = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//         user: "a601af2b4b131b",
//         pass: "e260293c2a30e8"
//     }
// });
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Route member /login');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const member = yield Member.findOne({ email });
        if (!member) {
            res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            return;
        }
        if (member) {
            console.log('member found!!');
            const isMatch = yield member.comparePassword(password);
            if (!isMatch) {
                res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
                return;
            }
            const payload = {
                member: {
                    id: member._id,
                    username: member.userName,
                    email: member.email,
                    role: member.role
                }
            };
            const token = jwt.sign(payload, config.jwtSecret, { expiresIn: 360000 });
            // Send success response
            res.json({ token, member });
        }
    }
    catch (err) {
        console.error('Error in /api/auth/login route:', err);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Reset password
router.post('/request-password-reset', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in backend /request-password-reset');
    const { email } = req.body;
    console.log('email: ', email);
    const member = yield Member.findOne({ email });
    if (!member) {
        res.status(404).json({ message: 'Email not found.' });
    }
    const token = crypto.randomBytes(32).toString('hex'); // Generate token
    if (member) {
        member.resetToken = token; // Save token to member record
        member.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour expiration
        yield member.save();
        console.log('after member token reset');
        yield sendResetEmail(email, token); // Function to send email
        res.status(200).json({ message: 'Password reset email sent.' });
    }
}));
// Password reset
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    const member = yield Member.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!member) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
    // Validate new password (e.g., length, complexity)
    if (newPassword.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    // Hash the password
    const salt = yield bcrypt.genSalt(10);
    if (member) {
        member.password = yield bcrypt.hash(newPassword, salt);
        member.resetToken = undefined; // Clear the token
        member.resetTokenExpiration = undefined; // Clear expiration
        yield member.save();
        res.status(200).json({ message: 'Password has been reset successfully.' });
    }
}));
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
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in create member ');
    console.log('Incoming request body:', req.body);
    try {
        let { firstName, lastName, email, password, username, role } = req.body;
        // Check if the user already exists
        const existingUser = yield Member.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
        }
        // Create a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        // Hash the password before saving
        const hashedPassword = yield bcrypt.hash(password, 10);
        // Create initial member data
        const initialMemberData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            username,
            status: req.body.status || 'pending approval',
            joinedDate: req.body.joinedDate || new Date(),
            verificationToken,
            affiliated: req.body.affiliated || null,
            membership_type: req.body.membership_type || null,
            phone: req.body.phone || null,
            address: req.body.address || null,
        };
        // Create and save the new member
        const newMember = new Member(initialMemberData);
        yield newMember.save();
        // Send verification email
        const verificationLink = `http://localhost:${process.env.PORT}/verify/${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@example.com',
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking on the following link: ${verificationLink}`,
            html: `<p>Please verify your email by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p>`,
        };
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent successfully:', info);
        });
        res.status(201).json({ message: 'User registered. Check your email for verification.' });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
}));
/**
 * @summary Get all members.
 * @route GET /members
 * @returns {Array<IMember>} 200 - An array of member objects.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const members = yield Member.find({});
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
/**
 * @summary Get a member by ID.
 * @route GET /members/{memberId}
 * @param {string} memberId.path.required - The ID of the member.
 * @returns {IMember} 200 - The member object.
 * @returns {Error} 404 - Member not found.
 */
router.get('/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member.findById(req.params.memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
/**
 * @summary Update a member by ID.
 * @route PUT /members/{memberId}
 * @param {string} memberId.path.required - The ID of the member to update.
 * @param {Object} req.body - The updated member data.
 * @returns {IMember} 200 - The updated member object.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 400 - Validation error.
 */
router.put('/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member.findByIdAndUpdate(req.params.memberId, req.body, { new: true, runValidators: true });
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
/**
 * @summary Delete a member by ID.
 * @route DELETE /members/{memberId}
 * @param {string} memberId.path.required - The ID of the member to delete.
 * @returns {Object} 200 - Confirmation message.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 500 - Internal server error.
 */
router.delete('/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member.findByIdAndDelete(req.params.memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        res.json({ message: 'Member deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
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
router.post('/:memberId/attendance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in router.post(/:memberId/attendance');
    try {
        const { memberId } = req.params;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            res.status(400).json({ message: 'Invalid member ID format' });
        }
        const { date, attended } = req.body;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            member.attendanceRecord.push({ date, attended });
            yield member.save();
            res.status(201).json(member.attendanceRecord[member.attendanceRecord.length - 1]);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
/**
 * @summary Get attendance record for a member.
 * @route GET /members/{memberId}/attendance
 * @param {string} memberId.path.required - The ID of the member.
 * @returns {Array} 200 - The attendance records for the member.
 * @returns {Error} 404 - Member not found.
 * @returns {Error} 500 - Internal server error.
 */
router.get('/:memberId/attendance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId } = req.params;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            res.json(member.attendanceRecord);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
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
router.put('/:memberId/attendance/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const { date, attended } = req.body;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
            if (!record) {
                res.status(404).json({ message: 'Attendance record not found' });
            }
            if (record) {
                record.date = date;
                record.attended = attended;
            }
            yield member.save();
            res.json(record);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
/**
 * @summary Delete attendance record for a member.
 * @route DELETE /members/{memberId}/attendance/{recordId}
 * @param {string} memberId.path.required - The ID of the member.
 * @param {string} recordId.path.required - The ID of the attendance record.
 * @returns {Object} 200 - Confirmation message.
 * @returns {Error} 404 - Member or attendance record not found.
 * @returns {Error} 500 - Internal server error.
 */
router.delete('/:memberId/attendance/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            const recordIndex = member.attendanceRecord.findIndex(r => r.date.getTime() === Number(recordId));
            if (recordIndex === -1) {
                res.status(404).json({ message: 'Attendance record not found' });
            }
            member.attendanceRecord.splice(recordIndex, 1);
            yield member.save();
            res.json({ message: 'Attendance record deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
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
router.post('/:memberId/tithes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in router.post(/:memberId/tithes');
    try {
        const { memberId } = req.params;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            res.status(400).json({ message: 'Invalid member ID format' });
        }
        const { date, amount } = req.body;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            member.tithes.push({ date, amount });
            yield member.save();
            res.status(201).json(member.tithes[member.tithes.length - 1]);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
/**
* @summary Get tithe record for a member.
* @route GET /members/{memberId}/tithes
* @param {string} memberId.path.required - The ID of the member.
* @returns {Array} 200 - The tithes records for the member.
* @returns {Error} 404 - Member not found.
* @returns {Error} 500 - Internal server error.
*/
router.get('/:memberId/tithes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId } = req.params;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            res.json(member.tithes);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
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
router.put('/:memberId/tithes/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const { date, amount } = req.body;
        const member = yield Member.findById(memberId);
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
                yield member.save();
                res.json(record);
            }
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
/**
* @summary Delete tithes record for a member.
* @route DELETE /members/{memberId}/tithes/{recordId}
* @param {string} memberId.path.required - The ID of the member.
* @param {string} recordId.path.required - The ID of the tithes record.
* @returns {Object} 200 - Confirmation message.
* @returns {Error} 404 - Member or tithe record not found.
* @returns {Error} 500 - Internal server error.
*/
router.delete('/:memberId/tithes/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            const recordIndex = member.tithes.findIndex(r => r.date.getTime() === Number(recordId));
            if (recordIndex === -1) {
                res.status(404).json({ message: 'Tithe record not found' });
            }
            member.tithes.splice(recordIndex, 1);
            yield member.save();
            res.json({ message: 'Tithe record deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
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
router.post('/:memberId/offerings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in router.post(/:memberId/offerings');
    try {
        const { memberId } = req.params;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            res.status(400).json({ message: 'Invalid member ID format' });
        }
        const { date, amount } = req.body;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            member.offerings.push({ date, amount });
            yield member.save();
            res.status(201).json(member.tithes[member.offerings.length - 1]);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
/**
* @summary Get offerings record for a member.
* @route GET /members/{memberId}/offerings
* @param {string} memberId.path.required - The ID of the member.
* @returns {Array} 200 - The offerings records for the member.
* @returns {Error} 404 - Member not found.
* @returns {Error} 500 - Internal server error.
*/
router.get('/:memberId/offerings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId } = req.params;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            res.json(member.offerings);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
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
router.put('/:memberId/offerings/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const { date, amount } = req.body;
        const member = yield Member.findById(memberId);
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
                yield member.save();
                res.json(record);
            }
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
/**
* @summary Delete offerings record for a member.
* @route DELETE /members/{memberId}/offerings/{recordId}
* @param {string} memberId.path.required - The ID of the member.
* @param {string} recordId.path.required - The ID of the offerings record.
* @returns {Object} 200 - Confirmation message.
* @returns {Error} 404 - Member or offerings record not found.
* @returns {Error} 500 - Internal server error.
*/
router.delete('/:memberId/offerings/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const member = yield Member.findById(memberId);
        if (!member) {
            res.status(404).json({ message: 'Member not found' });
        }
        if (member) {
            const recordIndex = member.offerings.findIndex(r => r.date.getTime() === Number(recordId));
            if (recordIndex === -1) {
                res.status(404).json({ message: 'Offerings record not found' });
            }
            member.offerings.splice(recordIndex, 1);
            yield member.save();
            res.json({ message: 'Offering record deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
export default router;
//# sourceMappingURL=Members.js.map