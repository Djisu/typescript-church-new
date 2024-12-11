/// <reference types="vitest" />
import express from 'express';
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import authRouter from '../routes/api/Auth.js';
import { User } from '../../models/Users.js';
import { sendResetEmailUser } from '../utils/emailUser.js';
// Create an Express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
console.log('in requestPasswordReset.test.ts');
// Mock the User model
vi.mock('../../models/Users.js');
// Mock the sendResetEmailUser function
vi.mock('../utils/emailUser.js', () => ({
    sendResetEmailUser: vi.fn()
}));
describe('POST /api/auth/request-password-reset', () => {
    afterEach(() => {
        vi.clearAllMocks(); // Clear mocks after each test
    });
    it('should return 404 if the email is not found', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null); // Simulate user not found
        const res = await request(app).post('/api/auth/request-password-reset').send({ email: 'nonexistent@example.com' });
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'User email not found.' });
    });
    it('should send a password reset email if the user is found', async () => {
        const mockUser = {
            resetToken: null,
            resetTokenExpiration: null,
            save: vi.fn().mockResolvedValue(true), // Mock save method
        };
        vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);
        const res = await request(app).post('/api/auth/request-password-reset').send({ email: 'user@example.com' });
        // Ensure the reset token and expiration are set
        expect(mockUser.resetToken).toBeDefined();
        expect(mockUser.resetTokenExpiration).toBeDefined();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Password reset email sent.' });
        // Assert that the mock function was called with the expected arguments
        expect(sendResetEmailUser).toHaveBeenCalledWith('user@example.com', expect.any(String)); // Check if email function is called
    });
});
//# sourceMappingURL=requestPasswordReset.test.js.map