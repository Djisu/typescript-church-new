import express, { Request, Response } from 'express';
import multer, { diskStorage, Multer } from 'multer';
import path from 'path';
import fs from 'fs';
import usersData from '../../usersData';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

import { User, IUser, UserSchema } from '../../../models/Users.js';


const router = express.Router();

// Define the uploads directory path under the public folder
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Define the storage configuration with correct types
const storage = diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir); // Save uploaded files in the uploads directory under public
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// Seed the users table
router.post('/seed', async (req: Request, res: Response) => {
   // console.log('Received /seed request')

    // try {
    //   await User.deleteMany({});

    //   await User.insertMany(usersData);

    //   res.status(200).json({ message: 'Users seeded successfully' });
    // } catch (error: any) {
    //   res.status(500).json({ error: error.message });
    // }
  });

// Create a new user
router.post('/', upload.single('avatar'), async (req: Request, res: Response) => {
  
  console.log('Hit /register');

  console.log('Received request on /register');
  console.log('Request Body:', req.body);
  console.log('Request Files:', req.files);

  try {
    
    const { username, email, password, role } = req.body;
   
    // Check if user exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    user = await User.create({ username, email, password: hashedPassword, role, avatar:  req.file?.path, });

    res.status(201).json(user);
  } catch (err: any) {
    console.error('Error processing file upload:', err); // Log the error
    return res.status(500).json({ message: 'An error occurred during registration', error: err.message });
  }
});

// Get all users
router.get('/', async (req: Request, res: Response) => {

  console.log('in router.get(/users)')

  try {
    const users: IUser[] = await User.find({});

    if (!users) {
      console.log('Users not found!!!!!')
    }

    console.log('users: ', users)

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user: IUser | null = await User.findById(userId);
     console.log('in router.get(/:userId): ' + req.params.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('user: ', user)

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user
router.put('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, avatar } = req.body;

    const user: IUser | null = await User.findByIdAndUpdate(
      req.params.userId,
      { username, email, password, role, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user
router.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const user: IUser | null = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;