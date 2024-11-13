import jwt from 'jsonwebtoken';
// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        // Create a user object that matches the AuthenticatedUser interface
        req.user = {
            id: decoded.id, // Assuming `id` is included in the token payload
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            avatar: decoded.avatar || '', // Provide a default value if needed
        }; // Type assertion
        next();
    }
    catch (error) {
        res.status(403).json({ message: 'Failed to authenticate token' });
        return;
    }
};
export default verifyToken;
//# sourceMappingURL=verifyToken.js.map