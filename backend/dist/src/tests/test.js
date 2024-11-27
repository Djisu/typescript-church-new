import request from 'supertest';
import express from 'express';
import { expect } from 'vitest';
const app = express();
app.use(express.json());
app.post('/test', (req, res) => {
    res.json({ message: 'success', body: req.body });
});
// Test Suite
describe('POST /test', () => {
    it('should return success message with body', async () => {
        const response = await request(app)
            .post('/test')
            .send({ key: 'value' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'success',
            body: { key: 'value' },
        });
    });
});
//# sourceMappingURL=test.js.map