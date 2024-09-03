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
const router = express_1.default.Router();
// Create a new member
router.post('/members', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Members_1.Member.create(req.body);
        res.status(201).json(member);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Get all members
router.get('/members', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const members = yield Members_1.Member.find({});
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get a specific member
router.get('/members/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Update a member
router.put('/members/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Delete a member
router.delete('/members/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Create attendance record
router.post('/members/:memberId/attendance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId } = req.params;
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
// Get attendance record for a member
router.get('/members/:memberId/attendance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Update attendance record for a member
router.put('/members/:memberId/attendance/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const { date, attended } = req.body;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        // Assuming recordId is a string representing the timestamp
        const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
        if (record) {
            // do something with the record
            console.log(record.date, record.attended);
        }
        else {
            console.log('Record not found');
        }
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
// Delete attendance record for a member
router.delete('/members/:memberId/attendance/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        // Assuming recordId is a string representing the timestamp
        const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
        if (record) {
            // do something with the record
            console.log(record.date, record.attended);
        }
        else {
            console.log('Record not found');
        }
        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        // Find the index of the record you want to remove
        const recordIndex = member.attendanceRecord.findIndex(r => r.date.getTime() === Number(recordId));
        if (recordIndex !== -1) {
            // Remove the record from the array
            member.attendanceRecord.splice(recordIndex, 1);
            console.log('Record removed');
        }
        else {
            console.log('Record not found');
        }
        yield member.save();
        res.json({ message: 'Attendance record deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Create tithe record
router.post('/members/:memberId/tithes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId } = req.params;
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
// Get tithe records for a member
router.get('/members/:memberId/tithes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Update a tithe record
router.put('/members/:memberId/tithes/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const { date, amount } = req.body;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        // Assuming recordId is a string representing the timestamp
        const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
        if (record) {
            // do something with the record
            console.log(record.date, record.attended);
        }
        else {
            console.log('Record not found');
        }
        if (!record) {
            return res.status(404).json({ message: 'Tithe record not found' });
        }
        record.date = date;
        // Create a new record with the desired properties
        const newRecord = { date: new Date(), attended: true, amount: 10 };
        // Add the new record to the attendanceRecord array
        member.attendanceRecord.push(newRecord);
        yield member.save();
        res.json(record);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete a tithe record
router.delete('/members/:memberId/tithes/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        // Assuming recordId is a string representing the timestamp
        const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
        if (record) {
            // do something with the record
            console.log(record.date, record.attended);
        }
        else {
            console.log('Record not found');
        }
        if (!record) {
            return res.status(404).json({ message: 'Tithe record not found' });
        }
        // Find the index of the record you want to remove
        const recordIndex = member.attendanceRecord.findIndex(r => r.date.getTime() === Number(recordId));
        if (recordIndex !== -1) {
            // Remove the record from the array
            member.attendanceRecord.splice(recordIndex, 1);
            console.log('Record removed');
        }
        else {
            console.log('Record not found');
        }
        yield member.save();
        res.json({ message: 'Tithe record deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Create offering record
router.post('/members/:memberId/offerings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId } = req.params;
        const { date, amount } = req.body;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        member.offerings.push({ date, amount });
        yield member.save();
        res.status(201).json(member.offerings[member.offerings.length - 1]);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Get offering records for a member
router.get('/members/:memberId/offerings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Update an offering record
router.put('/members/:memberId/offerings/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const { date, amount } = req.body;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        // Assuming recordId is a string representing the timestamp
        const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
        if (record) {
            // do something with the record
            console.log(record.date, record.attended);
        }
        else {
            console.log('Record not found');
        }
        if (!record) {
            return res.status(404).json({ message: 'Offering record not found' });
        }
        record.date = date;
        // Create a new record with the desired properties
        const newRecord = { date: new Date(), attended: true, amount: 10 };
        // Add the new record to the attendanceRecord array
        member.attendanceRecord.push(newRecord);
        yield member.save();
        res.json(record);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete an offering record
router.delete('/members/:memberId/offerings/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId, recordId } = req.params;
        const member = yield Members_1.Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        // Assuming recordId is a string representing the timestamp
        const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
        if (record) {
            // do something with the record
            console.log(record.date, record.attended);
        }
        else {
            console.log('Record not found');
        }
        if (!record) {
            return res.status(404).json({ message: 'Offering record not found' });
        }
        // Find the index of the record you want to remove
        const recordIndex = member.attendanceRecord.findIndex(r => r.date.getTime() === Number(recordId));
        if (recordIndex !== -1) {
            // Remove the record from the array
            member.attendanceRecord.splice(recordIndex, 1);
            console.log('Record removed');
        }
        else {
            console.log('Record not found');
        }
        yield member.save();
        res.json({ message: 'Offering record deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=Members.js.map