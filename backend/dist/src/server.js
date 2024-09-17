"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
mongoose_1.default.set('strictQuery', true);
// Load environment variables from .env file
dotenv_1.default.config();
console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);
console.log('MongoDB URI:', process.env.MONGODB_URI);
// Initialize the Express application
const app = (0, express_1.default)();
// Serve static files from the frontend build directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/dist')));
const dbURI = process.env.MONGODB_URI || 'your_default_connection_string'; // Use the environment variable
// Middleware configuration
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Multer storage configuration
const storage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});
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
// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../frontend/dist/index.html'));
});
// Connect to MongoDB
mongoose_1.default.disconnect();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('Error during disconnection:', error);
    }
    try {
        yield mongoose_1.default.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        // Event listeners for the connection
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('Disconnected from MongoDB');
        });
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
    }
});
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on port ${port}`);
    yield connectDB(); // Connect to MongoDB here
}));
// Handle process signals
process.once('SIGUSR2', () => {
    process.kill(process.pid, 'SIGUSR2');
});
process.on('SIGINT', () => {
    // Perform any cleanup tasks or shutdown operations here
    process.exit(0);
});
//# sourceMappingURL=server.js.map