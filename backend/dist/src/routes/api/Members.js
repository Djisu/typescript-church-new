"use strict";
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
const Members_1 = require("../../../models/Members");
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
const transport = nodemailer_1.default.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "a601af2b4b131b",
        pass: "e260293c2a30e8"
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
 * @param {string} req.body.username - The username of the member.
 * @returns {Object} 201 - The created member object.
 * @returns {Error} 400 - User already exists or validation errors.
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in member router.post');
    console.log('Incoming request body:', req.body);
    try {
        let { firstName, lastName, email, password, username } = req.body;
        // Check if the user already exists
        const existingUser = yield Members_1.Member.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create a verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Hash the password before saving
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create initial member data
        const initialMemberData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
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
        const newMember = new Members_1.Member(initialMemberData);
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
        // Send the email
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent successfully:', info);
            res.status(201).json({ message: 'User registered. Check your email for verification.' });
        });
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
        const members = yield Members_1.Member.find({});
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
        const member = yield Members_1.Member.findById(req.params.memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
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
        const member = yield Members_1.Member.findByIdAndUpdate(req.params.memberId, req.body, { new: true, runValidators: true });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
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
        const member = yield Members_1.Member.findByIdAndDelete(req.params.memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
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
        if (!mongoose_1.default.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid member ID format' });
        }
        const { date, attended } = req.body;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        member.attendanceRecord.push({ date, attended });
        yield member.save();
        res.status(201).json(member.attendanceRecord[member.attendanceRecord.length - 1]);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member.attendanceRecord);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        record.date = date;
        record.attended = attended;
        yield member.save();
        res.json(record);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const recordIndex = member.attendanceRecord.findIndex(r => r.date.getTime() === Number(recordId));
        if (recordIndex === -1) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        member.attendanceRecord.splice(recordIndex, 1);
        yield member.save();
        res.json({ message: 'Attendance record deleted' });
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
        if (!mongoose_1.default.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid member ID format' });
        }
        const { date, amount } = req.body;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        member.tithes.push({ date, amount });
        yield member.save();
        res.status(201).json(member.tithes[member.tithes.length - 1]);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member.tithes);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const record = member.tithes.find(r => r.date.getTime() === Number(recordId));
        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        record.date = date;
        record.amount = amount;
        yield member.save();
        res.json(record);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const recordIndex = member.tithes.findIndex(r => r.date.getTime() === Number(recordId));
        if (recordIndex === -1) {
            return res.status(404).json({ message: 'Tithe record not found' });
        }
        member.tithes.splice(recordIndex, 1);
        yield member.save();
        res.json({ message: 'Tithe record deleted' });
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
        if (!mongoose_1.default.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid member ID format' });
        }
        const { date, amount } = req.body;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        member.offerings.push({ date, amount });
        yield member.save();
        res.status(201).json(member.tithes[member.offerings.length - 1]);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member.offerings);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const record = member.offerings.find(r => r.date.getTime() === Number(recordId));
        if (!record) {
            return res.status(404).json({ message: 'Offering record not found' });
        }
        record.date = date;
        record.amount = amount;
        yield member.save();
        res.json(record);
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
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const recordIndex = member.offerings.findIndex(r => r.date.getTime() === Number(recordId));
        if (recordIndex === -1) {
            return res.status(404).json({ message: 'Offerings record not found' });
        }
        member.offerings.splice(recordIndex, 1);
        yield member.save();
        res.json({ message: 'Offering record deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=Members.js.map