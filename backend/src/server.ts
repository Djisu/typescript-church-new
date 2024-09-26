import dotenv from 'dotenv';
import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import multer, { diskStorage, StorageEngine } from 'multer'; // Use lowercase 'multer'
import eventsRoute from './routes/api/Events';
import membersRoute from './routes/api/Members';
import usersRoute from './routes/api/Users';
import authRoute from './routes/api/Auth';

import colors from 'colors';
import { ConnectOptions } from 'mongoose';
import path  from 'path';

//type File = Express.multer.File;



//const file: File = req.file;

mongoose.set('strictQuery', false);

// Load environment variables from .env file
dotenv.config();

console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Initialize the Express application
const app: Express = express();
const port = process.env.PORT || 3000;

const dbURI: string = process.env.MONGODB_URI! //|| 'your_default_connection_string'; // Use the environment variable

console.log('About to disconnect')

mongoose.disconnect()

console.log('ABOUT TO CONNECT')

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as ConnectOptions).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const allowedOrigins = [
    'https://church-management-frontend.onrender.com',
    'http://localhost:5173' // Allow local development
];
// Middleware configuration
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // If you need to send cookies or authentication headers
}));
app.options('*', cors()); // Enable pre-flight across-the-board

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/api/events', eventsRoute);
app.use('/api/members', membersRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the API!');
});

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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



// Catch-all route to serve the frontend application
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Connect to MongoDB

// const connectDB = async () => {
//   try {
//     await mongoose.disconnect()
//     await mongoose.connect(dbURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     } as ConnectOptions);
//     console.log('Connected to MongoDB');

//     // Event listeners for the connection
//     mongoose.connection.on('disconnected', () => {
//       console.log('Disconnected from MongoDB');
//     });
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//   }
// };

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



