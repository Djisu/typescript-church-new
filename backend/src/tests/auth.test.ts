import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express, { Request, Response, Router } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import mongoose, { ConnectOptions } from 'mongoose';
import { User, IUser } from '../../models/Users'; // Adjust the import based on your structure
import config from '../utils/config'; // Ensure this path is correct

// Create a mock for the User model
let mockFindOne = vi.fn();

// Mock the User model
vi.mock('../../models/Users', () => {
    class User {
        async comparePassword(): Promise<boolean> {
            return true; // assuming it resolves to true
        }
        async save(): Promise<this> {
            return this; // Return the instance on save
        }
    }

    return {
        User: User,
    };
});

// Mock the jwt module
vi.mock('jsonwebtoken', () => ({
    sign: vi.fn().mockImplementation(() => 'token'),
    verify: vi.fn().mockImplementation(() => ({ id: 'userId' })),
    decode: vi.fn().mockImplementation(() => ({ id: 'userId' })),
}));

// Mock the express module
vi.mock('express', async (importOriginal) => {
    const actualExpress = await importOriginal<typeof import('express')>();

    return {
        ...actualExpress,
        json: vi.fn().mockImplementation(() => (req: Request, res: Response, next: Function) => next()),
    };
});

const app = express();
app.use(express.json());

let mongoServer: MongoMemoryServer;

// Use the provided hashed password
const hashedPassword = '$2b$10$4itzWETfVF7GYNknGCleK.1qnWO2bIEKavgINTzxoqiEAjg/CyfX';

async function createTestUser(email: string, password: string): Promise<void> {
    const user = new User({ email, password }); // Use the hashed password directly
    await user.save();
}

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 45000,
    } as ConnectOptions);

    await createTestUser('pfleischer2002@yahoo.co.uk', hashedPassword);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const router = Router();

// Define your login route
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email, password } = req.body;

    try {
        const user: IUser | null = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            return;
        }

        const payload = { user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar } };
        const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: 360000 });
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.use('/api/auth', router);

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return token and user on successful login', async () => {
        const mockUser: Partial<IUser> = {
            _id: '1',
            username: 'Paul Jesu Fleischer',
            email: 'pfleischer2002@yahoo.co.uk',
            role: 'admin',
            avatar: 'avatar.png',
            comparePassword: vi.fn().mockResolvedValue(true), // Simulate successful password comparison
        };

        mockFindOne.mockResolvedValue(mockUser); // Mock findOne to return the mock user

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'pfleischer2002@yahoo.co.uk', password: 'password123' }); // Provide the plain text password

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.user).toEqual({
            id: mockUser._id,
            username: mockUser.username,
            email: mockUser.email,
            role: mockUser.role,
            avatar: mockUser.avatar,
        });
    });

    it('should return 400 if user does not exist', async () => {
        mockFindOne.mockResolvedValue(null); // Simulate no user found

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nonexistent@example.com', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Invalid Credentials');
    });

    it('should return 400 if password does not match', async () => {
        const mockUser: Partial<IUser> = {
            _id: '1',
            username: 'testUser',
            email: 'pfleischer2002@yahoo.co.uk',
            comparePassword: vi.fn().mockResolvedValue(false), // Simulate password mismatch
        };

        mockFindOne.mockResolvedValue(mockUser); // Return the mock user

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'pfleischer2002@yahoo.co.uk', password: 'wrongPassword' });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Invalid Credentials');
    });

    it('should return 500 on server error', async () => {
        mockFindOne.mockRejectedValue(new Error('Database error')); // Simulate a database error

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'pfleischer2002@yahoo.co.uk', password: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Server error');
    });
});
