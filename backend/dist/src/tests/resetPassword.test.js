import express from 'express';
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import authRouter from '../routes/api/Auth.js'; // Adjust the path to your auth router
import { User } from '../../models/Users.js'; // Adjust the path to your User model
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
console.log('Testing resetPassword.test.ts');
// Mock the User model
vi.mock('../../models/Users.js', () => ({
    User: {
        findOne: vi.fn(),
        save: vi.fn(),
    },
}));
const validToken = 'a' + '0'.repeat(63); // Define a valid token
const mockUser = {
    _id: '123',
    resetToken: validToken,
    resetTokenExpiration: new Date(Date.now() + 3600000), // 1 hour in the future
    password: 'oldPassword',
    save: vi.fn().mockResolvedValue(true), // Ensure save is mocked
};
// Properly mock bcrypt
vi.mock('bcrypt', async (importOriginal) => {
    const actual = await importOriginal(); // Get the original bcrypt module
    return {
        ...actual, // Explicitly cast to an object type
        hash: vi.fn().mockResolvedValue('hashedPassword'), // Mock hash method
        genSalt: vi.fn().mockResolvedValue(10), // Mock genSalt method
    };
});
beforeAll(() => {
    // Mock User.findOne method to return mockUser
    vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
});
afterAll(() => {
    // Clean up mocks after all tests are done
    vi.restoreAllMocks();
});
describe('POST /api/auth/reset-password', () => {
    afterEach(() => {
        vi.clearAllMocks(); // Clear mocks after each test
    });
    it('should return 400 for invalid token format', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'invalidToken', newPassword: 'newPass123' });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid token format.' });
    });
    it('should return 400 if the token is not found', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: validToken, newPassword: 'newPass123' });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Token not found.' });
    });
    it('should return 400 if the token is expired', async () => {
        const expiredUser = { ...mockUser, resetTokenExpiration: new Date(Date.now() - 3600000) }; // 1 hour ago
        vi.spyOn(User, 'findOne').mockResolvedValue(expiredUser);
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: expiredUser.resetToken, newPassword: 'newPass123' });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid or expired token.' });
    });
    it('should return 400 if the new password is too short', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: mockUser.resetToken, newPassword: '123' });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Password must be at least 6 characters long.' });
    });
    afterEach(() => {
        vi.clearAllMocks(); // Clear mocks after each test
    });
    it('should successfully reset the password', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: mockUser.resetToken, newPassword: 'newPassword123' });
        const bcryptSpy = vi.spyOn(bcrypt, 'hash'); // Mock bcrypt.hash method
        //const saveSpy = vi.spyOn(User.prototype,'save'); // Mock User.save method
        // Assertions
        // Expectations
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Password has been reset successfully.' });
        // Check if password was hashed and saved
        expect(mockUser.password).not.toBe('oldPassword'); // Ensure the password was changed correctly
        expect(mockUser.save).toHaveBeenCalled(); // Ensure save was called
        // Assertions for bcrypt methods
        expect(bcryptSpy).toHaveBeenCalled(); // Check if hash was called
        expect(bcryptSpy).toHaveBeenCalledWith('newPassword123', expect.any(Number)); // Check the specific arguments
        expect(bcrypt.genSalt).toHaveBeenCalled(); // Check if genSalt was called
    }, 10000);
});
//# sourceMappingURL=resetPassword.test.js.map