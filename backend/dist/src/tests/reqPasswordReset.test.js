import { vi, it, expect, describe, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import { User } from './models/User'; // Replace with actual import
import { sendResetEmailUser } from './services/emailService'; // Replace with actual import
import { router } from './routes/auth'; // Replace with actual router import
// Create an instance of the Express app and use the router
const app = express();
app.use(express.json());
app.use(router);
vi.mock('./models/User'); // Mock the User model
vi.mock('./services/emailService'); // Mock the email service
vi.mock('crypto'); // Mock crypto library
describe('POST /request-password-reset', () => {
    let mockFindOne;
    let mockSave;
    let mockSendEmail;
    let mockRandomBytes;
    beforeEach(() => {
        // Reset mocks before each test
        mockFindOne = vi.fn();
        mockSave = vi.fn();
        mockSendEmail = vi.fn();
        mockRandomBytes = vi.fn();
        // Mock the User model's findOne and save methods
        User.findOne = mockFindOne;
        User.prototype.save = mockSave;
        // Mock the email sending function
        sendResetEmailUser = mockSendEmail;
        // Mock the randomBytes function of crypto
        crypto.randomBytes = mockRandomBytes;
    });
    it('should send a reset email when user is found', async () => {
        const email = 'testuser@example.com';
        const fakeToken = 'abcdef1234567890'; // Fake token
        // Set up mock behavior
        mockFindOne.mockResolvedValueOnce({
            email,
            resetToken: '',
            resetTokenExpiration: new Date(),
            save: mockSave,
        });
        mockRandomBytes.mockReturnValueOnce(Buffer.from(fakeToken, 'hex'));
        mockSendEmail.mockResolvedValueOnce(true); // Simulate successful email sending
        // Perform the test request
        const response = await request(app)
            .post('/request-password-reset')
            .send({ email });
        // Assertions
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password reset email sent.');
        expect(mockFindOne).toHaveBeenCalledWith({ email });
        expect(mockRandomBytes).toHaveBeenCalledWith(32);
        expect(mockSave).toHaveBeenCalled();
        expect(mockSendEmail).toHaveBeenCalledWith(email, fakeToken);
    });
    it('should return 404 if the email is not found', async () => {
        const email = 'nonexistent@example.com';
        // Set up mock behavior for a non-existing user
        mockFindOne.mockResolvedValueOnce(null);
        // Perform the test request
        const response = await request(app)
            .post('/request-password-reset')
            .send({ email });
        // Assertions
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User email not found.');
        expect(mockFindOne).toHaveBeenCalledWith({ email });
        expect(mockSave).not.toHaveBeenCalled(); // Ensure save was not called
        expect(mockSendEmail).not.toHaveBeenCalled(); // Ensure email was not sent
    });
    it('should handle error when saving user fails', async () => {
        const email = 'testuser@example.com';
        const fakeToken = 'abcdef1234567890';
        // Set up mock behavior
        mockFindOne.mockResolvedValueOnce({
            email,
            resetToken: '',
            resetTokenExpiration: new Date(),
            save: mockSave,
        });
        mockRandomBytes.mockReturnValueOnce(Buffer.from(fakeToken, 'hex'));
        mockSendEmail.mockResolvedValueOnce(true);
        // Simulate save failure
        mockSave.mockRejectedValueOnce(new Error('Save failed'));
        // Perform the test request
        const response = await request(app)
            .post('/request-password-reset')
            .send({ email });
        // Assertions
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('An error occurred during password reset.');
        expect(mockFindOne).toHaveBeenCalledWith({ email });
        expect(mockRandomBytes).toHaveBeenCalledWith(32);
        expect(mockSendEmail).toHaveBeenCalledWith(email, fakeToken);
    });
});
//# sourceMappingURL=reqPasswordReset.test.js.map