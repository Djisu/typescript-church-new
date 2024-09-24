import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose, { ConnectOptions } from 'mongoose';
import multer, { diskStorage } from 'multer';
import path from 'path';

import eventsRoute from './routes/api/Events';
import membersRoute from './routes/api/Members';
import usersRoute from './routes/api/Users';
import authRoute from './routes/api/Auth';

dotenv.config(); // Load environment variables at the start

// Logging email and MongoDB URI for debugging purposes
console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);
console.log('MongoDB URI:', process.env.MONGODB_URI);

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define storage configuration for multer
const storage = diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, path.join(__dirname, 'public', 'uploads')); // Adjust the destination as needed
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });


// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Connect to MongoDB
const connectDB = async () => {
    // const dbURI: string = process.env.MONGODB_URI!; // Non-null assertion
    const dbURI: string | undefined = process.env.MONGODB_URI;
    if (!dbURI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB with URI:', dbURI);
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Define routes
app.use('/api/events', eventsRoute);
app.use('/api/members', membersRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);

// Start the server
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await connectDB(); // Connect to MongoDB here
});






// import express, { Express, Request, Response } from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import multer, { diskStorage } from 'multer';
// import eventsRoute from './routes/api/Events';
// import membersRoute from './routes/api/Members';
// import usersRoute from './routes/api/Users';
// import authRoute from './routes/api/Auth';
// import dotenv from 'dotenv';
// import colors from 'colors';
// import { ConnectOptions } from 'mongoose';
// import path  from 'path';

// mongoose.set('strictQuery', false);

// // Load environment variables from .env file
// dotenv.config();

// console.log('Email User:', process.env.EMAIL_USER);
// console.log('App Password:', process.env.APP_PASSWORD);
// console.log('MongoDB URI:', process.env.MONGODB_URI);

// // Initialize the Express application
// const app: Express = express();

// // Serve static files from the frontend build directory
// app.use(express.static(path.join(__dirname, '../frontend/dist')));


// const dbURI: string = process.env.MONGODB_URI || 'your_default_connection_string'; // Use the environment variable



// // Middleware configuration
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Multer storage configuration
// const storage = diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads'); // Directory to save uploaded files
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
//   },
// });

// // Middleware to log incoming requests
// app.use((req: Request, res: Response, next: any) => {
//   console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // Define routes
// app.use('/api/events', eventsRoute);
// app.use('/api/members', membersRoute);
// app.use('/api/users', usersRoute);
// app.use('/api/auth', authRoute);

// // Default route
// app.get('/', (req: Request, res: Response) => {
//   res.send('Welcome to the API!');
// });

// // Catch-all route to serve the frontend application
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });

// // Connect to MongoDB
// mongoose.disconnect()
// const connectDB = async () => {
//   try {
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//   } catch (error) {
//       console.error('Error during disconnection:', error);
//   }

//   try {
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

// // Start the server
// const port = process.env.PORT || 3000;
// app.listen(port, async () => {
//   console.log(`Server is running on port ${port}`);
//   //await connectDB(); // Connect to MongoDB here
// });

// // Handle process signals
// process.once('SIGUSR2', () => {
//   process.kill(process.pid, 'SIGUSR2');
// });

// process.on('SIGINT', () => {
//   // Perform any cleanup tasks or shutdown operations here
//   process.exit(0);
// });