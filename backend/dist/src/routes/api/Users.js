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
/**
 * @swagger
 * /seed:
 *   post:
 *     summary: Seed user data
 *     description: Deletes existing user data and inserts predefined user data into the database.
 *     tags: [Seeding]
 *     responses:
 *       200:
 *         description: Users seeded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating that users were seeded.
 *                   example: "Users seeded successfully"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *                   example: "Error message"
 */
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
/**
 * @swagger
 * /:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with the provided details and an optional avatar image.
 *     tags: [User Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the new user.
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the new user.
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: The password for the new user.
 *                 example: "SecurePassword123"
 *               role:
 *                 type: string
 *                 description: The role of the new user (e.g., admin, user).
 *                 example: "user"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file for the new user.
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the registered user.
 *                   example: "john_doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The email address of the registered user.
 *                   example: "john@example.com"
 *                 role:
 *                   type: string
 *                   description: The role of the registered user.
 *                   example: "user"
 *                 avatar:
 *                   type: string
 *                   description: The path to the uploaded avatar image.
 *                   example: "/uploads/avatars/john_doe.png"
 *       400:
 *         description: Bad request due to validation errors or user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Error message.
 *                         example: "User already exists"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "An error occurred during registration"
 */
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
/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Fetches all users from the database.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: The username of the user.
 *                     example: "john_doe"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The email address of the user.
 *                     example: "john@example.com"
 *                   role:
 *                     type: string
 *                     description: The role of the user (e.g., admin, user).
 *                     example: "user"
 *                   avatar:
 *                     type: string
 *                     description: The URL/path to the user's avatar image.
 *                     example: "/uploads/avatars/john_doe.png"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "An error occurred while retrieving users"
 */
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
/**
 * @swagger
 * /{userId}:
 *   get:
 *     summary: Retrieve a specific user
 *     description: Fetches the user details for a given user ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user to be retrieved.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the user.
 *                   example: "john_doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The email address of the user.
 *                   example: "john@example.com"
 *                 role:
 *                   type: string
 *                   description: The role of the user (e.g., admin, user).
 *                   example: "user"
 *                 avatar:
 *                   type: string
 *                   description: The URL/path to the user's avatar image.
 *                   example: "/uploads/avatars/john_doe.png"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the user was not found.
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message.
 *                   example: "An error occurred while retrieving the user"
 */
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
/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update a specific user
 *     description: Updates the details of a user identified by their user ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user to be updated.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The updated username of the user.
 *                 example: "john_doe_updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The updated email address of the user.
 *                 example: "john_updated@example.com"
 *               password:
 *                 type: string
 *                 description: The updated password for the user.
 *                 example: "NewSecurePassword123"
 *               role:
 *                 type: string
 *                 description: The updated role of the user (e.g., admin, user).
 *                 example: "admin"
 *               avatar:
 *                 type: string
 *                 description: The updated URL/path to the user's avatar image.
 *                 example: "/uploads/avatars/john_doe_updated.png"
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The updated username of the user.
 *                   example: "john_doe_updated"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The updated email address of the user.
 *                   example: "john_updated@example.com"
 *                 role:
 *                   type: string
 *                   description: The updated role of the user.
 *                   example: "admin"
 *                 avatar:
 *                   type: string
 *                   description: The updated URL/path to the user's avatar image.
 *                   example: "/uploads/avatars/john_doe_updated.png"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the user was not found.
 *                   example: "User not found"
 *       400:
 *         description: Bad request due to validation errors or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *                   example: "Validation failed"
 */
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
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a specific user
 *     description: Deletes a user identified by their user ID from the database.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user to be deleted.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8e1c4f1f4b1b"
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating the user has been deleted.
 *                   example: "User deleted"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the user was not found.
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Generic error message indicating the reason for the failure.
 *                   example: "An error occurred while deleting the user"
 */
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