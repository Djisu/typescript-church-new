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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let db = config_1.default.get('mongoURI');
mongoose_1.default.set('strictQuery', true);
// Use the default connection URI or an environment variable if available
//db = process.env.MONGODB_URI || db;
console.log('db:', db);
// Store the connection status
let isConnected = false;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in connectDB');
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        console.log('in about to connect');
        const dbURI = 'mongodb+srv://Djesu:Timbuk2tudjesu@cluster0.nlxec.mongodb.net/churchsoft?retryWrites=true&w=majority&appName=Cluster0'; //config.get('mongoURI'); // or use your connection string directly
        yield mongoose_1.default.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        isConnected = true; // Update connection status
        // console.log('MongoDB Connected...');
        // //
        // // Event listeners for the connection
        // mongoose.connection.on('connected', () => {
        //   console.log('Connected to MongoDB');
        // });
        // mongoose.connection.on('error', (err) => {
        //   console.error(`MongoDB connection error: ${err}`);
        // });
        // mongoose.connection.on('disconnected', () => {
        //   console.log('Disconnected from MongoDB');
        //   isConnected = false; // Update connection status
        // });
        // //
        // console.log('MongoDB Connected...');
    }
    catch (error) {
        console.error('MongoDB connection error:', error.message);
        isConnected = false;
        // Exit process with failure
        process.exit(1);
    }
});
exports.default = connectDB;
//# sourceMappingURL=db.js.map