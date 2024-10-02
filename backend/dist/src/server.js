var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer, { diskStorage } from 'multer'; // Use lowercase 'multer'
import eventsRoute from './routes/api/Events.js';
import membersRoute from './routes/api/Members.js';
import usersRoute from './routes/api/Users.js';
import authRoute from './routes/api/Auth.js';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname as pathDirname } from 'path';
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
const app = express();
const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI; //|| 'your_default_connection_string'; // Use the environment variable
console.log('About to disconnect');
//mongoose.disconnect()
console.log('ABOUT TO CONNECT');
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
// const allowedOrigins = [
//     'https://church-management-frontend.onrender.com',
//     'https://typescript-church-new.onrender.com',
//     'http://localhost:5173' // Allow local development
// ];
// // Use CORS middleware
// app.use(cors({
//     origin: allowedOrigins,
//     methods: ['GET', 'POST', 'OPTIONS'], // Specify allowed methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
//     credentials: true, // Allow credentials such as cookies
// }));
app.use(cors({ origin: 'https://church-management-frontend.onrender.com' }));
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
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});
// Serve static files from the frontend build directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/dist')));
// Set up multer storage
const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
// Initialize multer with storage
const upload = multer({ storage });
//const upload = multer({ dest: 'uploads/' });
// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    console.log('Request headers:', req.headers); // Log headers for debugging
    next();
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
app.use(morgan('dev'));
// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
// Start the server
//const port = process.env.PORT || 3000;
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on port ${port}`);
    //await connectDB(); // Connect to MongoDB here
}));
//connectDB()
// Handle process signals
process.once('SIGUSR2', () => {
    process.kill(process.pid, 'SIGUSR2');
});
process.on('SIGINT', () => {
    // Perform any cleanup tasks or shutdown operations here
    process.exit(0);
});
//# sourceMappingURL=server.js.map