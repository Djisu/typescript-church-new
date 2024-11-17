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
// Create a new 
/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new event
 *     description: Creates a new event and sends notifications to all members via email.
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the event.
 *                 example: "Annual Company Meeting"
 *               description:
 *                 type: string
 *                 description: A brief description of the event.
 *                 example: "Discussion of annual achievements and future goals."
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date and time of the event in ISO 8601 format.
 *                 example: "2023-12-01T10:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time of the event in ISO 8601 format.
 *                 example: "2023-12-01T12:00:00Z"
 *               location:
 *                 type: string
 *                 description: The location where the event will take place.
 *                 example: "Conference Room A"
 *               registrations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     memberId:
 *                       type: string
 *                       description: The ID of the member registering for the event.
 *                       example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                     registeredAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time of registration in ISO 8601 format.
 *                       example: "2023-11-01T10:00:00Z"
 *     responses:
 *       201:
 *         description: Successfully created the event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the created event.
 *                   example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                 title:
 *                   type: string
 *                   description: The title of the event.
 *                   example: "Annual Company Meeting"
 *                 description:
 *                   type: string
 *                   description: A brief description of the event.
 *                   example: "Discussion of annual achievements and future goals."
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   description: The start date and time of the event.
 *                   example: "2023-12-01T10:00:00Z"
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   description: The end date and time of the event.
 *                   example: "2023-12-01T12:00:00Z"
 *                 location:
 *                   type: string
 *                   description: The location where the event will take place.
 *                   example: "Conference Room A"
 *                 registrations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       memberId:
 *                         type: string
 *                         description: The ID of the member who registered.
 *                         example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                       registeredAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time of registration.
 *                         example: "2023-11-01T10:00:00Z"
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
 *                   example: "Error creating event or sending emails."
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
        // Create the new event
        const createdEvent = yield Event.create(newEvent);
        // Fetch all members to get their email addresses
        const members = yield Member.find({}, 'email'); // Get only the email field
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
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a member for an event
 *     description: Allows a member to register for a specific event by providing their member ID and event ID.
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: The ID of the member registering for the event.
 *                 example: "60c72b2f9b1d8e1c4f1f4b1a"
 *               eventId:
 *                 type: string
 *                 description: The ID of the event for which the member is registering.
 *                 example: "60c72b2f9b1d8e1c4f1f4b1b"
 *               registeredAt:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time of registration in ISO 8601 format.
 *                 example: "2023-11-01T10:00:00Z"
 *     responses:
 *       200:
 *         description: Successfully registered the member for the event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the updated event.
 *                   example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                 title:
 *                   type: string
 *                   description: The title of the event.
 *                   example: "Annual Company Meeting"
 *                 registrations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       memberId:
 *                         type: string
 *                         description: The ID of the member who registered.
 *                         example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                       registeredAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time of registration.
 *                         example: "2023-11-01T10:00:00Z"
 *       400:
 *         description: Bad request due to validation errors or already registered member.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Member is already registered for this event"
 *       404:
 *         description: Event not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Event not found"
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
/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve all events
 *     description: Fetches a list of all events from the database.
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of events.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique identifier of the event.
 *                     example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                   title:
 *                     type: string
 *                     description: The title of the event.
 *                     example: "Annual Company Meeting"
 *                   description:
 *                     type: string
 *                     description: A brief description of the event.
 *                     example: "Discussion of annual achievements and future goals."
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                     description: The start date and time of the event in ISO 8601 format.
 *                     example: "2023-12-01T10:00:00Z"
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                     description: The end date and time of the event in ISO 8601 format.
 *                     example: "2023-12-01T12:00:00Z"
 *                   location:
 *                     type: string
 *                     description: The location where the event will take place.
 *                     example: "Conference Room A"
 *                   registrations:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         memberId:
 *                           type: string
 *                           description: The ID of the member who registered.
 *                           example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                         registeredAt:
 *                           type: string
 *                           format: date-time
 *                           description: The date and time of registration.
 *                           example: "2023-11-01T10:00:00Z"
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
 *                   example: "Internal server error"
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('in backend router.get');
        const events = yield Event.find();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get a specific event by ID
/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Retrieve a specific event by ID
 *     description: Fetches the details of a specific event using its unique identifier.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the event to retrieve.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: Successfully retrieved the event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the event.
 *                   example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                 title:
 *                   type: string
 *                   description: The title of the event.
 *                   example: "Annual Company Meeting"
 *                 description:
 *                   type: string
 *                   description: A brief description of the event.
 *                   example: "Discussion of annual achievements and future goals."
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   description: The start date and time of the event in ISO 8601 format.
 *                   example: "2023-12-01T10:00:00Z"
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   description: The end date and time of the event in ISO 8601 format.
 *                   example: "2023-12-01T12:00:00Z"
 *                 location:
 *                   type: string
 *                   description: The location where the event will take place.
 *                   example: "Conference Room A"
 *                 registrations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       memberId:
 *                         type: string
 *                         description: The ID of the member who registered.
 *                         example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                       registeredAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time of registration.
 *                         example: "2023-11-01T10:00:00Z"
 *       404:
 *         description: Event not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Event not found"
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
 *                   example: "Internal server error"
 */
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
/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update an existing event by ID
 *     description: Updates the details of a specific event using its unique identifier.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the event to update.
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
 *               title:
 *                 type: string
 *                 description: The updated title of the event.
 *                 example: "Updated Company Meeting"
 *               description:
 *                 type: string
 *                 description: The updated description of the event.
 *                 example: "Updated discussion of annual achievements and future goals."
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The updated start date and time of the event in ISO 8601 format.
 *                 example: "2023-12-01T10:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The updated end date and time of the event in ISO 8601 format.
 *                 example: "2023-12-01T12:00:00Z"
 *               location:
 *                 type: string
 *                 description: The updated location where the event will take place.
 *                 example: "Updated Conference Room A"
 *               registrations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     memberId:
 *                       type: string
 *                       description: The ID of the member registering for the event.
 *                       example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                     registeredAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time of registration in ISO 8601 format.
 *                       example: "2023-11-01T10:00:00Z"
 *     responses:
 *       200:
 *         description: Successfully updated the event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the updated event.
 *                   example: "60c72b2f9b1d8e1c4f1f4b1b"
 *                 title:
 *                   type: string
 *                   description: The updated title of the event.
 *                   example: "Updated Company Meeting"
 *                 description:
 *                   type: string
 *                   description: The updated description of the event.
 *                   example: "Updated discussion of annual achievements and future goals."
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   description: The updated start date and time of the event.
 *                   example: "2023-12-01T10:00:00Z"
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   description: The updated end date and time of the event.
 *                   example: "2023-12-01T12:00:00Z"
 *                 location:
 *                   type: string
 *                   description: The updated location of the event.
 *                   example: "Updated Conference Room A"
 *                 registrations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       memberId:
 *                         type: string
 *                         description: The ID of the member who registered.
 *                         example: "60c72b2f9b1d8e1c4f1f4b1a"
 *                       registeredAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time of registration.
 *                         example: "2023-11-01T10:00:00Z"
 *       400:
 *         description: Bad request due to validation errors or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid input data"
 *       404:
 *         description: Event not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Event not found"
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
 *                   example: "Internal server error"
 */
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
// Delete an 
/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a specific event by ID
 *     description: Deletes a specific event using its unique identifier.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the event to delete.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: Successfully deleted the event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: "Event deleted"
 *       404:
 *         description: Event not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Event not found"
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
 *                   example: "Internal server error"
 */
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
/**
 * @swagger
 * /{id}/send-message:
 *   post:
 *     summary: Send a message to registered members of an event
 *     description: Sends a text message to the phone numbers of all members registered for a specific event using its unique identifier.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the event for which to send messages.
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
 *               message:
 *                 type: string
 *                 description: The message to be sent to registered members.
 *                 example: "Don't forget about the upcoming event!"
 *     responses:
 *       200:
 *         description: Successfully sent text messages to registered members.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: "Text messages sent successfully"
 *       400:
 *         description: Bad request due to missing message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Message is required"
 *       404:
 *         description: Event not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Event not found"
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
 *                   example: "Internal server error"
 */
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