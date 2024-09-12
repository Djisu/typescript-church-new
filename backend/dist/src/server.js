"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = require("multer");
const Events_1 = __importDefault(require("./routes/api/Events"));
const Members_1 = __importDefault(require("./routes/api/Members"));
const Users_1 = __importDefault(require("./routes/api/Users"));
const Auth_1 = __importDefault(require("./routes/api/Auth"));
//import fileUpload from 'express-fileupload';
const db_1 = __importDefault(require("../config/db"));
const colors_1 = __importDefault(require("colors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);
console.log('in backend server.js');
mongoose_1.default.set('strictQuery', true);
const log = (message) => {
    console.log(colors_1.default.cyan(message));
};
const error = (message) => {
    console.error(colors_1.default.red(message));
};
// Initialize the Express application
const app = (0, express_1.default)();
// Connect to MongoDB
(0, db_1.default)();
// Configure middleware
app.use((0, cors_1.default)());
// Configure CORS
// const corsOptions = {
//   origin: 'http://localhost/5173', // Allow your frontend's origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add any methods you need
//   credentials: true, // Optional: if you need to send cookies
// };
// app.use(cors(corsOptions));
app.use(express_1.default.json());
// Multer storage configuration
const storage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
    Error.stackTraceLimit = Infinity;
}
// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});
// Define routes
app.use('/api/events', Events_1.default);
app.use('/api/members', Members_1.default);
app.use('/api/users', Users_1.default);
app.use('/api/auth', Auth_1.default);
// Default route
app.get('/', (req, res) => {
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
//# sourceMappingURL=server.js.map