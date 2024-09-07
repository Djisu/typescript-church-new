import express, { Request, Response } from 'express';
import { Member, IMember } from '../../../models/Members';
import nodemailer, { SendMailOptions, SentMessageInfo } from 'nodemailer';
import crypto from 'crypto'
import bcrypt from 'bcrypt';

const router = express.Router();

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "a601af2b4b131b",
      pass: "e260293c2a30e8"
    }
  });

  // Create a new member and send email
router.post('/', async (req: Request, res: Response) => {
  console.log('in member router.post');
  console.log('Incoming request body:', req.body);
 

  try {
    let { firstName, lastName, email, password, username } = req.body;

    // Check if the user already exists
    const existingUser = await Member.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

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
    const newMember = new Member(initialMemberData);
    await newMember.save();

    // Send verification email
    const verificationLink = `http://localhost:${process.env.PORT}/verify/${verificationToken}`;

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@example.com',
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking on the following link: ${verificationLink}`,
      html: `<p>Please verify your email by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    // Send the email
    transport.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent successfully:', info);
      res.status(201).json({ message: 'User registered. Check your email for verification.' });
    });

  } catch (error: any) {
    console.error('Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all members
router.get('/members', async (req: Request, res: Response) => {
  try {
    const members: IMember[] = await Member.find({});

    res.json(members);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific member
router.get('/members/:memberId', async (req: Request, res: Response) => {
  try {
    const member: IMember | null = await Member.findById(req.params.memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a member
router.put('/members/:memberId', async (req: Request, res: Response) => {
  try {
    const member: IMember | null = await Member.findByIdAndUpdate(
      req.params.memberId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a member
router.delete('/members/:memberId', async (req: Request, res: Response) => {
  try {
    const member: IMember | null = await Member.findByIdAndDelete(
      req.params.memberId
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create attendance record
router.post('/members/:memberId/attendance', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { date, attended } = req.body;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.attendanceRecord.push({ date, attended });
    await member.save();

    res.status(201).json(member.attendanceRecord[member.attendanceRecord.length - 1]);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance record for a member
router.get('/members/:memberId/attendance', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member: IMember | null = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member.attendanceRecord);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update attendance record for a member
router.put('/members/:memberId/attendance/:recordId', async (req: Request, res: Response) => {
  try {
    const { memberId, recordId } = req.params;
    const { date, attended } = req.body;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

   // Assuming recordId is a string representing the timestamp
  const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
  if (record) {
    // do something with the record
    console.log(record.date, record.attended);
  } else {
    console.log('Record not found');
  }

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    record.date = date;
    record.attended = attended;
    await member.save();

    res.json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance record for a member
router.delete('/members/:memberId/attendance/:recordId', async (req: Request, res: Response) => {
  try {
    const { memberId, recordId } = req.params;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

     // Assuming recordId is a string representing the timestamp
    const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
    if (record) {
      // do something with the record
      console.log(record.date, record.attended);
    } else {
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
    } else {
      console.log('Record not found');
    }


    await member.save();

    res.json({ message: 'Attendance record deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create tithe record
router.post('/members/:memberId/tithes', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { date, amount } = req.body;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.tithes.push({ date, amount });
    await member.save();

    res.status(201).json(member.tithes[member.tithes.length - 1]);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get tithe records for a member
router.get('/members/:memberId/tithes', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member: IMember | null = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member.tithes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a tithe record
router.put('/members/:memberId/tithes/:recordId', async (req: Request, res: Response) => {
  try {
    const { memberId, recordId } = req.params;
    const { date, amount } = req.body;

    const member: IMember | null = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

     // Assuming recordId is a string representing the timestamp
    const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
    if (record) {
      // do something with the record
      console.log(record.date, record.attended);
    } else {
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

    await member.save();

    res.json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a tithe record
router.delete('/members/:memberId/tithes/:recordId', async (req: Request, res: Response) => {
  try {
    const { memberId, recordId } = req.params;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

     // Assuming recordId is a string representing the timestamp
    const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
    if (record) {
      // do something with the record
      console.log(record.date, record.attended);
    } else {
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
    } else {
      console.log('Record not found');
    }

    await member.save();

    res.json({ message: 'Tithe record deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create offering record
router.post('/members/:memberId/offerings', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { date, amount } = req.body;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.offerings.push({ date, amount });
    await member.save();

    res.status(201).json(member.offerings[member.offerings.length - 1]);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get offering records for a member
router.get('/members/:memberId/offerings', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member: IMember | null = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member.offerings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update an offering record
router.put('/members/:memberId/offerings/:recordId', async (req: Request, res: Response) => {
  try {
    const { memberId, recordId } = req.params;
    const { date, amount } = req.body;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Assuming recordId is a string representing the timestamp
    const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
    if (record) {
      // do something with the record
      console.log(record.date, record.attended);
    } else {
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

    await member.save();

    res.json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an offering record
router.delete('/members/:memberId/offerings/:recordId', async (req: Request, res: Response) => {
  try {
    const { memberId, recordId } = req.params;

    const member: IMember | null = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

     // Assuming recordId is a string representing the timestamp
    const record = member.attendanceRecord.find(r => r.date.getTime() === Number(recordId));
    if (record) {
      // do something with the record
      console.log(record.date, record.attended);
    } else {
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
   } else {
     console.log('Record not found');
   }

    await member.save();

    res.json({ message: 'Offering record deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;