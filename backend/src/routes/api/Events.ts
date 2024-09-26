import { Request, Response, Router } from 'express';
import { Event, IEvent } from '../../../models/Events';
import mongoose from 'mongoose';
import { sendTextMessage } from '../../utils/textMessaging'; 

const router = Router();

// Create a new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const newEvent: Partial<IEvent> = {
        title: req.body.title,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        location: req.body.location,
        registrations: req.body.registrations.map((reg: any) => ({
          memberId: new mongoose.Types.ObjectId(reg.memberId),
          registeredAt: reg.registeredAt,
        })),
      };

    const createdEvent = await Event.create(newEvent);

    res.status(201).json(createdEvent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific event by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
       res.status(404).json({ message: 'Event not found' });
    }
    if (event) {
      res.json(event);
    } 
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update an event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        location: req.body.location,
        registrations: req.body.registrations.map((reg: any) => ({
          memberId: new mongoose.Types.ObjectId(reg.memberId),
          registeredAt: reg.registeredAt,
        })),
      },
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an event
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
       res.status(404).json({ message: 'Event not found' });
    }
    if (event){
       res.json({ message: 'Event deleted' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send text message to event registrants
router.post('/:id/send-message', async (req: Request, res: Response): Promise<void> => {
    try {
      const event = await Event.findById(req.params.id);
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
        await Promise.all(phoneNumbers.map(phoneNumber => sendTextMessage(phoneNumber, message)));
    
        res.json({ message: 'Text messages sent successfully' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;