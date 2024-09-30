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
// Use this for the main connection
// mongoose.connect('mongodb+srv://Djesu:Timbuk2tudjesu@cluster0.nlxec.mongodb.net/churchsoft?retryWrites=true&w=majority&appName=Cluster0')
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
const allowedOrigins = [
    'https://church-management-frontend.onrender.com',
    'https://typescript-church-new.onrender.com',
    'http://localhost:5173' // Allow local development
];
// Use CORS middleware
app.use(cors({
    origin: allowedOrigins, //'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST', 'OPTIONS'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true, // Allow credentials such as cookies
}));
app.options('*', cors()); // Enable pre-flight across-the-board
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Ensure OPTIONS request can be handled
// Set preflight
// Define allowed methods and headers
// Define allowed methods and headers
const allowMethods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'];
const allowHeaders = [
    'Content-Type',
    'Authorization',
    'X-Content-Type-Options',
    'Accept',
    'X-Requested-With',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
];
app.options("*", (req, res) => {
    console.log("preflight");
    const origin = req.headers.origin;
    const requestedMethod = req.headers["access-control-request-method"];
    const requestedHeaders = req.headers["access-control-request-headers"];
    if (origin === "https://church-management-frontend.onrender.com" &&
        requestedMethod && allowMethods.includes(requestedMethod) &&
        requestedHeaders && allowHeaders.includes(requestedHeaders)) {
        console.log("pass");
        res.status(204).send();
    }
    else {
        console.log("fail");
        res.status(403).send(); // Optional: return forbidden status
    }
    return;
});
////new Experiment
//end of new Experiment
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.setHeader("Access-Control-Allow-Origin", "https://church-management-frontend.onrender.com");
//   res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Private-Network", "true");
//   res.setHeader("Access-Control-Max-Age", "7200");
//   next();
// });
//app.use(cors())
app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});
/////End of Experiment
// Define routes
app.use('/api/events', eventsRoute);
app.use('/api/members', membersRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
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