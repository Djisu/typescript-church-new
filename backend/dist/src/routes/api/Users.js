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
const express_1 = __importDefault(require("express"));
const multer_1 = __importStar(require("multer"));
const fs_1 = __importDefault(require("fs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const Users_js_1 = require("../../../models/Users.js");
const router = express_1.default.Router();
// Create uploads directory if it doesn't exist
if (!fs_1.default.existsSync('uploads')) {
    fs_1.default.mkdirSync('uploads', { recursive: true });
}
// Define the storage configuration with correct types
const storage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});
// Initialize multer with the storage configuration
const upload = (0, multer_1.default)({ storage });
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
    console.log('Request Files:', req.files);
    try {
        const { username, email, password, role } = req.body;
        // Check if user exists
        let user = yield Users_js_1.User.findOne({ email: email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        // Hash the password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Create the new user
        user = yield Users_js_1.User.create({ username, email, password: hashedPassword, role, avatar: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path, });
        res.status(201).json(user);
    }
    catch (err) {
        console.error('Error processing file upload:', err); // Log the error
        return res.status(500).json({ message: 'An error occurred during registration', error: err.message });
    }
}));
// Get all users
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in router.get(/users)');
    try {
        const users = yield Users_js_1.User.find({});
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
        const user = yield Users_js_1.User.findById(userId);
        console.log('in router.get(/:userId): ' + req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('user: ', user);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update a user
router.put('/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role, avatar } = req.body;
        const user = yield Users_js_1.User.findByIdAndUpdate(req.params.userId, { username, email, password, role, avatar }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete a user
router.delete('/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_js_1.User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// router.post('/login', [
//   check('email', 'Please include a valid email').isEmail(),
//   check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
// ], async (req: Request, res: Response) => {
//   console.log('Route hit');
//     const errors = validationResult(req);
//     console.log('in login');
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     } 
//     const { email, password } = req.body;
//     console.log('email, password: ', email, password);
//     try {
//       // Request user from the database by using the user's email
//       let user: IUser  | null = await User.findOne({ email });
//       //if (user){
//         console.log('user=== ', user)
//       //}
//       if (!user) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: 'Invalid Credentials' }] });
//       }
//       // Compare user provided password to the user's password stored in the database
//       //const isMatch = await user.comparePassword(password);
//       const isMatch = await UserSchema.methods.comparePassword.call(user, password);
//       console.log('isMatch is : ', isMatch)
//       if (!isMatch) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: 'Invalid Credentials' }] });
//       }
//       console.log("in auth router post user:", user);
//       // export interface IUser extends Document {
//       //   _id: string;
//       //   username: string;
//       //   email: string;
//       //   password: string;
//       //   role: string;
//       //   avatar?: string;
//       //   token?: string | null;
//       // }
//       //Return jsonwebtoken
//       const payload = {
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           avatar: user.avatar
//         }
//       };
//       jwt.sign(
//         payload,
//         config.jwtSecret,
//         { expiresIn: 360000 },
//         (err, token) => {
//           if (err) throw err;
//           res.json({ token });
//         }
//       );
//     } catch (err: any) {
//       console.error('Error in /users/login route:', err);
//     res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );
// async function authenticateUser(email: string, password: string): Promise<IUser | null> {
//    console.log('in authenticateUser: ', email)
//   const user = await User.findOne({ email });
//   if (!user) {
//     return null;
//   }
//   if (!(await user.comparePassword(password))) {
//     return null;
//   }
//   return user;
// }
exports.default = router;
//# sourceMappingURL=Users.js.map