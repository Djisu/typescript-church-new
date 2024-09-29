import dotenv from 'dotenv';
import express, { Request, Response, Express } from 'express';
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

import { fileURLToPath } from 'url';
import { dirname as pathDirname, join } from 'path';

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

// Use this for the main connection
// mongoose.connect('mongodb+srv://Djesu:Timbuk2tudjesu@cluster0.nlxec.mongodb.net/churchsoft?retryWrites=true&w=majority&appName=Cluster0')
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));

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

// Use CORS middleware
app.use(cors({
  origin: allowedOrigins,  //'http://localhost:5173', // Allow requests from this origin
  methods: ['GET', 'POST', 'OPTIONS'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true, // Allow credentials such as cookies
}));
app.options('*', cors()); // Enable pre-flight across-the-board
//app.options('/api/auth', cors()); // Preflight response for specific route

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure OPTIONS request can be handled
app.options('/api/auth', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200); // Respond with 200 OK
});
/////End of Experiment

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);

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



