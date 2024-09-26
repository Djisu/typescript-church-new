"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importStar(require("multer")); // Use lowercase 'multer'
const Events_1 = __importDefault(require("./routes/api/Events"));
const Members_1 = __importDefault(require("./routes/api/Members"));
const Users_1 = __importDefault(require("./routes/api/Users"));
const Auth_1 = __importDefault(require("./routes/api/Auth"));
const path_1 = __importDefault(require("path"));
//type File = Express.multer.File;
//const file: File = req.file;
mongoose_1.default.set('strictQuery', false);
// Load environment variables from .env file
dotenv_1.default.config();
console.log('Email User:', process.env.EMAIL_USER);
console.log('App Password:', process.env.APP_PASSWORD);
console.log('MongoDB URI:', process.env.MONGODB_URI);
// Initialize the Express application
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI; //|| 'your_default_connection_string'; // Use the environment variable
console.log('About to disconnect');
mongoose_1.default.disconnect();
console.log('ABOUT TO CONNECT');
mongoose_1.default.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
const allowedOrigins = [
    'https://church-management-frontend.onrender.com',
    'http://localhost:5173' // Allow local development
];
// Middleware configuration
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // If you need to send cookies or authentication headers
}));
app.options('*', (0, cors_1.default)()); // Enable pre-flight across-the-board
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Define routes
app.use('/api/events', Events_1.default);
app.use('/api/members', Members_1.default);
app.use('/api/users', Users_1.default);
app.use('/api/auth', Auth_1.default);
// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});
// Serve static files from the frontend build directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/dist')));
// Set up multer storage
const storage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
// Initialize multer with storage
const upload = (0, multer_1.default)({ storage });
//const upload = multer({ dest: 'uploads/' });
// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    console.log('Request headers:', req.headers); // Log headers for debugging
    next();
});
// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../frontend/dist/index.html'));
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