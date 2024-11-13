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
import mongoose from 'mongoose';
import { Event } from '../../../models/Events.js';
import { sendTextMessage } from '../../utils/textMessaging.js';
import { Member } from '../../../models/Members.js';
//import sendResetEmailMember from '../../utils/email/sendResetEmailMember';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
let frontendUrl = ""; //process.env.FRONTEND_URL; // Access the environment variable
const emailPassword = process.env.EMAIL_PASS;
const appPassword = process.env.APP_PASSWORD;
const emailUser = process.env.EMAIL_USER;
const port = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'development') {
    frontendUrl = "http://localhost:5173";
}
else if (nodeEnv === 'production') {
    frontendUrl = "https://typescript-church-new.onrender.com";
}
else {
    console.log('Invalid node environment variable'); //.slice()
}
const router = express.Router();
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: appPassword //'YOUR_GMAIL_PASSWORD_OR_APP_PASSWORD', 
    }
});
// Function to send an email
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Sending email to:', options.to);
    try {
        yield transport.sendMail({
            from: emailUser,
            to: options.to,
            subject: options.subject,
            text: options.text,
        });
        console.log(`Email sent to ${options.to}`);
    }
    catch (error) {
        console.error(`Failed to send email to ${options.to}:`, error);
        throw new Error(`Error sending email: ${options.to}`);
    }
});
// Create a new event
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in /create event backend');
    try {
        const newEvent = {
            title: req.body.title,
            description: req.body.description,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            location: req.body.location,
            registrations: req.body.registrations.map((reg) => ({
                memberId: new mongoose.Types.ObjectId(reg.memberId),
                registeredAt: reg.registeredAt,
            })),
        };
        console.log('before createEvent');
        // Create the new event
        const createdEvent = yield Event.create(newEvent);
        // Fetch all members to get their email addresses
        const members = yield Member.find({}, 'email'); // Get only the email field
        console.log('after createEvent');
        console.log('before emailPromises');
        // Prepare email details
        const emailPromises = members.map(member => {
            return sendEmail({
                to: member.email,
                subject: `New Event: ${createdEvent.title}`,
                text: `You are invited to the following event:\n\nTitle: ${createdEvent.title}\nDescription: ${createdEvent.description}\nStart Date: ${createdEvent.startDate}\nEnd Date: ${createdEvent.endDate}\nLocation: ${createdEvent.location}`,
            });
        });
        console.log('after emailPromises');
        // Send emails to all members
        yield Promise.all(emailPromises);
        console.log('after Promise.all');
        // Respond with the created event
        res.status(201).json(createdEvent);
    }
    catch (error) {
        console.error('Error creating event or sending emails:', error);
        res.status(400).json({ message: error.message });
    }
}));
// Update Event Registrations Endpoint
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { memberId, eventId, registeredAt } = req.body;
    try {
        // Find the event by ID
        const event = yield Event.findById(eventId);
        if (!event) {
            res.status(404).json({ message: 'Event not found' });
            return;
        }
        // Check if the member is already registered for the event
        const alreadyRegistered = event.registrations.some(reg => reg.memberId.toString() === memberId);
        if (alreadyRegistered) {
            res.status(400).json({ message: 'Member is already registered for this event' });
            return;
        }
        // Add the new registration
        event.registrations.push({
            memberId: new mongoose.Types.ObjectId(memberId),
            registeredAt: new Date(registeredAt),
        });
        // Save the updated event
        const updatedEvent = yield event.save();
        // Optionally, you can send a confirmation email to the member (if you have their email)
        const member = yield Member.findById(memberId);
        if (member) {
            yield sendEmail({
                to: member.email,
                subject: `Registration Confirmed: ${updatedEvent.title}`,
                text: `You have successfully registered for the following event:\n\nTitle: ${updatedEvent.title}\nDescription: ${updatedEvent.description}\nStart Date: ${updatedEvent.startDate}\nEnd Date: ${updatedEvent.endDate}\nLocation: ${updatedEvent.location}`
            });
        }
        // Respond with the updated event
        res.status(200).json(updatedEvent);
        return;
    }
    catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }
}));
// Get all events
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield Event.find();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get a specific event by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event.findById(req.params.id);
        if (!event) {
            res.status(404).json({ message: 'Event not found' });
        }
        if (event) {
            res.json(event);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update an event
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedEvent = yield Event.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            location: req.body.location,
            registrations: req.body.registrations.map((reg) => ({
                memberId: new mongoose.Types.ObjectId(reg.memberId),
                registeredAt: reg.registeredAt,
            })),
        }, { new: true });
        res.json(updatedEvent);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete an event
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event.findByIdAndDelete(req.params.id);
        if (!event) {
            res.status(404).json({ message: 'Event not found' });
        }
        if (event) {
            res.json({ message: 'Event deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Send text message to event registrants
router.post('/:id/send-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event.findById(req.params.id);
        if (!event) {
            res.status(404).json({ message: 'Event not found' });
        }
        if (event) {
            const { message } = req.body;
            if (!message) {
                res.status(400).json({ message: 'Message is required' });
            }
            // Get the phone numbers of the registered members
            const phoneNumbers = event.registrations.map(reg => reg.memberId.toString());
            // Send text messages to the registered members
            yield Promise.all(phoneNumbers.map(phoneNumber => sendTextMessage(phoneNumber, message)));
            res.json({ message: 'Text messages sent successfully' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
export default router;
// function sendEmail(arg0: { to: string; subject: string; text: string; }): any {
//   throw new Error('Function not implemented.');
// }
//# sourceMappingURL=Events.js.map