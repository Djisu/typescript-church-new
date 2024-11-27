import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
//import swaggerDocs from './config/swagger';
import multer, { diskStorage } from 'multer'; // Use lowercase 'multer'
import Events from './routes/api/Events.js';
import Members from './routes/api/Members.js';
import Users from './routes/api/Users.js';
import Auth from './routes/api/Auth.js';
import path from 'path';
import morgan from 'morgan';
//import { dirname as pathDirname } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
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
    serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
    socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
}).then(() => {
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TypeScript Church API',
            version: '1.0.0',
            description: 'API documentation for your Node.js backend',
        },
    },
    apis: ['src/routes/api/*.ts'], // Adjust based on your file structure
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
console.log('swaggerDocs: ', swaggerDocs);
// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Define routes
app.use('/api/events', Events);
app.use('/api/members', Members);
app.use('/api/users', Users);
app.use('/api/auth', Auth);
// Enable pre-flight across-the-board for all routes
app.options('*', cors());
// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});
// Serve static files from the frontend build directory
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = pathDirname(__filename);
const frontendPath = '/Users/pauljesufleischer/typescript-church/frontend/dist';
app.use(express.static(frontendPath));
//app.use(express.static(path.join(__dirname, '../frontend/dist')));
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
export default app;
//# sourceMappingURL=server.js.map