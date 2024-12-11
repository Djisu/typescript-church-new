
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * path:
 *   /api/auth/login:
 *     post:
 *       summary: Log in a user
 *       tags: [Auth]
 *       description: Logs in a user and returns a JWT token and user details.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: user@example.com
 *                 password:
 *                   type: string
 *                   example: password123
 *       responses:
 *         200:
 *           description: Successful login
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     example: your_jwt_token
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: someUserId
 *                       username:
 *                         type: string
 *                         example: john_doe
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       role:
 *                         type: string
 *                         example: user
 *                       avatar:
 *                         type: string
 *                         example: https://example.com/avatar.jpg
 *         400:
 *           description: Invalid credentials or validation errors
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   errors:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         msg:
 *                           type: string
 *                           example: Invalid Credentials
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Server error
 */
/// <reference types="vitest/globals" />
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
//import { check, validationResult } from 'express-validator';
import authRouter from '../routes/api/Auth.js'; // adjust the path to your auth router
import { User } from '../../models/Users.js'; // adjust the path to your User model
import { vi, Mock } from 'vitest'; // Import the vi object for mocks

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

const Mock = vi.fn(); // Mock the User model

// Mock the User model
vi.mock('../../models/Users.js');

describe('POST /api/auth/login', () => {
  
  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it('should log in successfully and return a token and user details', async () => {
    // Mocking a user result
    const mockUser = {
      _id: 'someUserId',
      username: 'john_doe',
      email: 'user@example.com',
      role: 'user',
      avatar: 'https://example.com/avatar.jpg',
      comparePassword: vi.fn().mockResolvedValue(true), // Mock comparison to return true
    };

    // Mock the User model to find the user
    vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
    const token = jwt.sign({ user: { id: mockUser._id } }, 'your_jwt_secret'); // Use your real JWT secret

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toEqual({
      _id: mockUser._id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role,
      avatar: mockUser.avatar,
    });
  });

  it('should return 400 if credentials are invalid', async () => {
    //(User.findOne as vi.Mock).mockResolvedValue(null); // Simulate user not found
    vi.spyOn(User, 'findOne').mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ errors: [{ msg: 'Invalid Credentials' }] });
  });

  it('should return 400 for validation errors', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid-email', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.length).toBeGreaterThan(0); // Check if there are validation errors
  });
  
  it('should return 500 if an error occurs', async () => {
    vi.spyOn(User, 'findOne').mockImplementationOnce(() => {
      throw new Error('Database error'); // Simulate an error
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Server error' });
  });
});
