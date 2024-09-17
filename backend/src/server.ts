import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer, { diskStorage } from 'multer';
import eventsRoute from './routes/api/Events';
import membersRoute from './routes/api/Members';
import usersRoute from './routes/api/Users';
import authRoute from './routes/api/Auth';
import dotenv from 'dotenv';
import colors from 'colors';
import { ConnectOptions } from 'mongoose';

// Load environment variables from .env file
dotenv.config();

console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Initialize the Express application
const app: Express = express();
const dbURI: string = process.env.MONGODB_URI || 'your_default_connection_string'; // Use the environment variable

mongoose.set('strictQuery', true);

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer storage configuration
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// Middleware to log incoming requests
app.use((req: Request, res: Response, next: any) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Define routes
app.use('/api/events', eventsRoute);
app.use('/api/members', membersRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the API!');
});

// Connect to MongoDB
mongoose.disconnect()
const connectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
      console.error('Error during disconnection:', error);
  }
  
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log('Connected to MongoDB');

    // Event listeners for the connection
    mongoose.connection.on('disconnected', () => {
      console.log('Disconnected from MongoDB');
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await connectDB(); // Connect to MongoDB here
});

// Handle process signals
process.once('SIGUSR2', () => {
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', () => {
  // Perform any cleanup tasks or shutdown operations here
  process.exit(0);
});