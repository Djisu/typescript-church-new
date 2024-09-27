var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { User } from '../../../models/Users.js';
import { fileURLToPath } from 'url';
import { dirname as pathDirname } from 'path';
const router = express.Router();
// Define the uploads directory path under the public folder
// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);
const uploadsDir = path.join(__dirname, 'public', 'uploads');
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Define the storage configuration with correct types
const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Save uploaded files in the uploads directory under public
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});
// Initialize multer with the storage configuration
const upload = multer({ storage });
// Seed the users table
router.post('/seed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('Received /seed request')
    // try {
    //   await User.deleteMany({});
    //   await User.insertMany(usersData);
    //   res.status(200).json({ message: 'Users seeded successfully' });
    // } catch (error: any) {
    //   res.status(500).json({ error: error.message });
    // }
}));
// Create a new user
router.post('/', upload.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('Hit /register');
    console.log('Received request on /register');
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.file);
    try {
        const { username, email, password, role } = req.body;
        // Check if user exists
        let user = yield User.findOne({ email: email });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        // Hash the password
        const salt = yield bcrypt.genSalt(10);
        const hashedPassword = yield bcrypt.hash(password, salt);
        // Create the new user
        user = yield User.create({ username, email, password: hashedPassword, role, avatar: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path, });
        res.status(201).json(user);
    }
    catch (err) {
        console.error('Error processing file upload:', err); // Log the error
        res.status(500).json({ message: 'An error occurred during registration', error: err.message });
    }
}));
// Get all users
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in router.get(/users)');
    try {
        const users = yield User.find({});
        if (!users) {
            console.log('Users not found!!!!!');
        }
        console.log('users: ', users);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get a specific user
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User.findById(userId);
        console.log('in router.get(/:userId): ' + req.params.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }
        console.log('user: ', user);
        if (user) {
            res.json(user);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update a user
router.put('/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role, avatar } = req.body;
        const user = yield User.findByIdAndUpdate(req.params.userId, { username, email, password, role, avatar }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }
        if (user) {
            res.json(user);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete a user
router.delete('/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findByIdAndDelete(req.params.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }
        if (user) {
            res.json({ message: 'User deleted' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
export default router;
//# sourceMappingURL=Users.js.map