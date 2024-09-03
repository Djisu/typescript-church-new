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
const express_1 = require("express");
const Events_1 = require("../../../models/Events");
const mongoose_1 = __importDefault(require("mongoose"));
const textMessaging_1 = require("../../utils/textMessaging");
const router = (0, express_1.Router)();
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
                memberId: new mongoose_1.default.Types.ObjectId(reg.memberId),
                registeredAt: reg.registeredAt,
            })),
        };
        const createdEvent = yield Events_1.Event.create(newEvent);
        res.status(201).json(createdEvent);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Get all events
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield Events_1.Event.find();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get a specific event by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Events_1.Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update an event
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedEvent = yield Events_1.Event.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            location: req.body.location,
            registrations: req.body.registrations.map((reg) => ({
                memberId: new mongoose_1.default.Types.ObjectId(reg.memberId),
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
        const event = yield Events_1.Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Send text message to event registrants
router.post('/:id/send-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Events_1.Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        // Get the phone numbers of the registered members
        const phoneNumbers = event.registrations.map(reg => reg.memberId.toString());
        // Send text messages to the registered members
        yield Promise.all(phoneNumbers.map(phoneNumber => (0, textMessaging_1.sendTextMessage)(phoneNumber, message)));
        res.json({ message: 'Text messages sent successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=Events.js.map