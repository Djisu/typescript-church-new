"use strict";
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = require("../../models/Users");
const process_1 = require("process");
const authController = {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                // Validate the email and password
                const user = yield Users_1.User.findOne({ email });
                if (!user || !user.validPassword(password)) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                // Generate the auth token
                const jwtSecret = process_1.env.JWT_SECRET;
                if (!jwtSecret) {
                    return res.status(500).json({ error: 'JWT secret not configured' });
                }
                const token = jsonwebtoken_1.default.sign({ userId: user._id }, jwtSecret, {
                    expiresIn: '1h',
                });
                res.json({ token });
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    },
};
exports.default = authController;
//# sourceMappingURL=authController.js.map