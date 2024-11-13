import dotenv from 'dotenv';
import express, { Request, Response, Express, NextFunction  } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import multer, { diskStorage, StorageEngine } from 'multer'; // Use lowercase 'multer'
import eventsRoute from './routes/api/Events.js';
import membersRoute from './routes/api/Members.js';
import usersRoute from './routes/api/Users.js';
import authRoute from './routes/api/Auth.js';

import colors from 'colors';
import { ConnectOptions } from 'mongoose';
import path  from 'path';
import morgan from 'morgan';

import { fileURLToPath } from 'url';
import { dirname as pathDirname, join } from 'path';

//import mongoose from'mongoose';
//import authenticateJWT from './utils/authenticateJWT.js';

mongoose.set('strictQuery', false);
mongoose.set('debug', true);

// Load environment variables from .env file
const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${environment}` });
dotenv.config();

console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Initialize the Express application
const app: Express = express();
const port = process.env.PORT || 3000;

const dbURI: string = process.env.MONGODB_URI! //|| 'your_default_connection_string'; // Use the environment variable

console.log('About to disconnect')

//mongoose.disconnect()

console.log('ABOUT TO CONNECT')

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
    socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
} as ConnectOptions).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const allowedOrigins = [
  'https://typescript-church-new.onrender.com', // Production
  'http://localhost:3000', // Local development
  'http://localhost:5173', // Local development
];

// Use CORS middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true // Allow credentials such as cookies
}));

//app.use(cors({ origin: 'https://church-management-frontend.onrender.com' }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/api/events', eventsRoute);
app.use('/api/members', membersRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);

// Enable pre-flight across-the-board for all routes
app.options('*', cors());


// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the API!');
});

// Serve static files from the frontend build directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);

const frontendPath = '/Users/pauljesufleischer/typescript-church/frontend/dist';

app.use(express.static(frontendPath));

//app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Set up multer storage
const storage: StorageEngine = diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
    cb(null, file.originalname);
  },
});

// Initialize multer with storage
const upload = multer({ storage });
//const upload = multer({ dest: 'uploads/' });

// Middleware to log incoming requests
app.use((req: Request, res: Response, next: any) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  console.log('Request headers:', req.headers); // Log headers for debugging
  next();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use(morgan('dev'));

// Catch-all route to serve the frontend application
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start the server
//const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  //await connectDB(); // Connect to MongoDB here
});

//connectDB()

// Handle process signals
process.once('SIGUSR2', () => {
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', () => {
  // Perform any cleanup tasks or shutdown operations here
  process.exit(0);
});



