"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'your-secret-key');
        req.user = decoded; // Type assertion to ensure the decoded object matches the IUser interface
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
    }
};
// Example of a protected route
// app.get('/protected', verifyToken, (req: Request, res: Response) => {
//   res.json({ message: 'This is a protected route' });
// });
//# sourceMappingURL=verifyToken.js.map