var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { Event } from '../../../models/Events.js';
import mongoose from 'mongoose';
import { sendTextMessage } from '../../utils/textMessaging.js';
const router = Router();
// Create a new event
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const createdEvent = yield Event.create(newEvent);
        res.status(201).json(createdEvent);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
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
//# sourceMappingURL=Events.js.map