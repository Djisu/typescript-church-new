import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer, { diskStorage } from 'multer';
import eventsRoute from './routes/api/Events';
import membersRoute from './routes/api/Members';
import usersRoute from './routes/api/Users';
import authRoute from './routes/api/Auth';
//import fileUpload from 'express-fileupload';
import connectDB from '../config/db';
import colors from 'colors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);

console.log('in backend server.js');

mongoose.set('strictQuery', true);

const log = (message: any) => {
  console.log(colors.cyan(message));
};

const error = (message: any) => {
  console.error(colors.red(message));
};

// Initialize the Express application
const app: Express = express();

// Connect to MongoDB
connectDB();

// Configure middleware
app.use(cors())

// Configure CORS
// const corsOptions = {
//   origin: 'http://localhost/5173', // Allow your frontend's origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add any methods you need
//   credentials: true, // Optional: if you need to send cookies
// };

// app.use(cors(corsOptions));

app.use(express.json());

// Multer storage configuration
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

app.use(express.urlencoded({ extended: true }));



if (process.env.NODE_ENV === 'development') {
  Error.stackTraceLimit = Infinity;
}

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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle SIGUSR2 signal (typically used for nodemon restarts)
process.once('SIGUSR2', function () {
  process.kill(process.pid, 'SIGUSR2');
});

// Handle SIGINT signal (typically used for Ctrl+C)
process.on('SIGINT', function () {
  // Perform any cleanup tasks or shutdown operations here
  // Terminate the process gracefully
  process.exit(0);
});